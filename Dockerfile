# build environment
#FROM node:14.15.4-alpine as build
#WORKDIR /app
#ENV PATH /app/node_modules/.bin:$PATH
#COPY package.json ./
#COPY package-lock.json ./
#RUN npm install
#RUN npm install react-scripts@4.0.3 -g --silent
#COPY . ./
#RUN npm run build

# production environment
FROM nginx:stable-alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
#COPY --from=build /app/build /usr/share/nginx/html
COPY ./build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

