import React from 'react';
import PropTypes from 'prop-types';

/**
 * Delays updating the URL by 1 second.
 * @param {string} url
 * @returns {string} the effective URL to use
 */
function useDebouncedUrl(url) {
  const [effectiveUrl, setEffectiveUrl] = React.useState(url);

  // If there is not an effective URL, set it immediately.
  if (url && !effectiveUrl) {
    setEffectiveUrl(url);
  }

  // Otherwise, wait 1 second before updating.
  React.useEffect(() => {
    if (url !== effectiveUrl) {
      const timeout = setTimeout(() => {
        setEffectiveUrl(url);
      }, 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [url, effectiveUrl]);

  return effectiveUrl;
}

function ExternalApplication({ data, onEdit, appContext }) {
  const urlMatch = data.match(/^(https?:\/\/.+)(\n|$)/);
  const url = urlMatch && urlMatch[1];
  const trimLength = urlMatch && urlMatch[0].length;

  const onExternalEdit = React.useCallback((nextData, receivedAppContext) => {
    onEdit(`${url}\n${nextData}`, receivedAppContext);
  }, [url, onEdit]);

  const effectiveUrl = useDebouncedUrl(url);

  if (!effectiveUrl) {
    return (
      <ExternalApplicationUrlNeeded
        onSubmit={(submittedUrl) => {
          onEdit(`${submittedUrl}\n${data}`, appContext);
        }}
      />
    );
  }

  return (
    <ExternalApplicationHost
      // Unmount and re-mount the iframe to prevent iframe from messing with top-level navigation.
      key={effectiveUrl}
      url={effectiveUrl}
      data={data.slice(trimLength)}
      onEdit={onExternalEdit}
      appContext={appContext}
    />
  );
}

ExternalApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};

function ExternalApplicationUrlNeeded({ onSubmit }) {
  const urlRef = React.useRef(/** @type {HTMLIFrameElement | null} */ (null));
  return (
    <form
      style={{
        border: '1px solid #999',
        background: '#eee',
        color: 'black',
        padding: '1em',
      }}
      onSubmit={(e) => {
        e.preventDefault();
        const submittedText = urlRef.current.value;
        onSubmit(submittedText);
      }}
    >
      Please enter a URL to external application:
      <br />
      <input type="url" required ref={urlRef} />
      <button type="submit">Load</button>
    </form>
  );
}

ExternalApplicationUrlNeeded.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

function ExternalApplicationHost({
  url, data, onEdit, appContext,
}) {
  const [height, setHeight] = React.useState(120);
  const iframeRef = React.useRef(/** @type {HTMLIFrameElement | null} */ (null));
  const latestDataRef = React.useRef(/** @type {string | null} */ (null));
  const latestAppContextRef = React.useRef(appContext);
  const latestStateRef = React.useRef(/** @type {{ data; appContext }} */ ({ data, appContext }));
  const onEditRef = React.useRef(onEdit);

  const synchronize = () => {
    const iframeWindow = iframeRef.current && iframeRef.current.contentWindow;
    if (!iframeWindow) {
      return;
    }
    if (latestDataRef.current !== latestStateRef.current.data) {
      latestDataRef.current = latestStateRef.current.data;
      iframeWindow.postMessage({ cattazState: latestStateRef.current }, '*');
    }
  };

  // Handle messages from iframe
  React.useLayoutEffect(() => {
    /**
     * @param {MessageEvent<HTMLIFrameElement>} e
     */
    const listener = (e) => {
      const iframeWindow = iframeRef.current && iframeRef.current.contentWindow;
      if (e.source !== iframeWindow) {
        return;
      }
      if (e.data.cattazGetState) {
        iframeWindow.postMessage({ cattazState: latestStateRef.current }, '*');
      }
      if (e.data.cattazEdit) {
        const { data: nextData } = e.data.cattazEdit;
        if (typeof nextData === 'string') {
          latestDataRef.current = nextData;
          onEditRef.current(nextData, latestAppContextRef.current);
        }
      }
      if (e.data.cattazSetHeight) {
        setHeight(e.data.cattazSetHeight);
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  // Synchronize state with iframe
  React.useLayoutEffect(() => {
    latestStateRef.current = { data };
    synchronize();
  }, [data]);

  // Ensure latest edit function is used
  React.useLayoutEffect(() => {
    onEditRef.current = onEdit;
  }, [onEdit]);

  // Ensure latest appContext is used
  React.useLayoutEffect(() => {
    latestAppContextRef.current = appContext;
  }, [appContext]);

  return (
    <iframe
      width="100%"
      height={height}
      frameBorder="0"
      src={url}
      ref={iframeRef}
      title={url}
    />
  );
}

ExternalApplicationHost.propTypes = {
  url: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};

export default ExternalApplication;
