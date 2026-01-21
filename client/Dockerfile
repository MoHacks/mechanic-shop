# ---------- Build stage ----------
    FROM node:18-alpine AS build

    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy source and build
    COPY . .
    RUN npm run build
    
    # ---------- Production stage ----------
    FROM nginx:alpine
    
    # Remove default config
    RUN rm /etc/nginx/conf.d/default.conf
    
    # Copy built React files
    COPY --from=build /app/build /usr/share/nginx/html
    
    # Expose internal port
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]    