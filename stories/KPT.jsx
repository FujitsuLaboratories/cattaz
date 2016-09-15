import React from 'react';

const cellStyle = {
  border: '1px solid silver',
  verticalAlign: 'top',
};

function Cell(props) {
  return (<td rowSpan={props.rowSpan} style={cellStyle}>
    <h2>{props.title}</h2>
    <ul>
      {props.items.map(s => (<li>{s}</li>))}
    </ul>
    <input type="text" placeholder={`Add ${props.title}`} />
  </td>);
}
Cell.propTypes = {
  title: React.PropTypes.string.isRequired,
  rowSpan: React.PropTypes.number,
  items: React.PropTypes.arrayOf(React.PropTypes.string),
};
Cell.defaultProps = {
  rowSpan: 1,
  items: [],
};

export default function KPT(props) {
  return (<table>
    <tbody>
      <tr>
        <Cell title="Keep" items={props.keeps} />
        <Cell title="Try" items={props.tries} rowSpan={2} />
      </tr>
      <tr>
        <Cell title="Problem" items={props.problems} />
      </tr>
    </tbody>
  </table>);
}
KPT.propTypes = {
  keeps: React.PropTypes.arrayOf(React.PropTypes.string),
  problems: React.PropTypes.arrayOf(React.PropTypes.string),
  tries: React.PropTypes.arrayOf(React.PropTypes.string),
};
KPT.defaultProps = {
  keeps: [],
  problems: [],
  tries: [],
};
