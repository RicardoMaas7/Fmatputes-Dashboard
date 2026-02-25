# Etapa 1: Compilación de Angular
FROM node:20-alpine AS build
WORKDIR /app

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar con ruteo relativo estricto para Nginx Proxy Manager
RUN npm run build -- --configuration production --base-href ./

# Etapa 2: Servidor web ligero
FROM nginx:alpine

# Copiar la configuración interna del SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los estáticos compilados (Angular 17 usa la carpeta browser por defecto)
COPY --from=build /app/dist/fmaputes-ui/browser /usr/share/nginx/html

# Exponer el puerto interno para la red de Docker
EXPOSE 80

# Comando de arranque
CMD ["nginx", "-g", "daemon off;"]