# Usamos una imagen ligera de Node
FROM node:20-alpine

# Python3 for radar chart generation (stdlib only — no pip needed)
RUN apk add --no-cache python3

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar dependencias e instalarlas (optimizando caché de Docker)
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copiar el código fuente del backend
COPY backend/ .

# Copiar los scripts de Python (baked into image)
COPY scripts/ ./scripts/

# Exponer el puerto (interno, Nginx lo enrutará)
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]