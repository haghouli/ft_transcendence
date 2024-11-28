FROM nginx

RUN apt-get update

COPY ./config/nginx.conf /etc/nginx/
COPY ./config/default.conf /etc/nginx/conf.d/

RUN mkdir certs
COPY ./certs/* /certs/

COPY ./frontend /usr/share/nginx/html/

EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]