FROM nginx

RUN rm /etc/nginx/conf.d/*

ADD scripts/default.conf /etc/nginx/conf.d/default.conf
ADD index.html /home/
ADD ./src /home/src