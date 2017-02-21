FROM node:6.9.5-onbuild

RUN npm run cover
RUN npm run build

CMD ["npm", "run", "server"]
