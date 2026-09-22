# ── Nginx ──────────────────────────────────────────────
FROM nginx:alpine

# SPA — в корень
COPY dist/dota2info/browser /usr/share/nginx/html

# Виджеты — в подпапку /elements/
COPY dist/dota2info-elements /usr/share/nginx/html/elements

# Конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
