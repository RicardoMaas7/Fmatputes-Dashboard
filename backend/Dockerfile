# Usamos una imagen ligera de Node
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar dependencias e instalarlas (optimizando caché de Docker)
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto (interno, Nginx lo enrutará)
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]