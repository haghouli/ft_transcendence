FROM nginx

RUN apt-get update

COPY nginx.conf /etc/nginx/
COPY default.conf /etc/nginx/conf.d/

EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]