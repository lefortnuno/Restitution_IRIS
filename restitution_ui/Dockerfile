# Build stage
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

# Copier les fichiers build React dans le dossier html de nginx 
COPY --from=build /app/build /usr/share/nginx/html
 
# Copier ta config nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]