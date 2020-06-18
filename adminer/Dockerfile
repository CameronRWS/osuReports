FROM adminer

USER root
RUN apk add --no-cache -t .tmp shadow \
        && usermod -u 1000 adminer \
        && chown -R adminer:adminer /var/www \
        && apk del .tmp
USER adminer

ADD plugins/* /var/www/html/plugins/
ADD plugins-enabled/* /var/www/html/plugins-enabled/