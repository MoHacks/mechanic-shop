# ---------- Build stage ----------
    FROM node:20-alpine AS build

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
	
    # Copy our custom nginx config
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copy built React files
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # Expose internal port
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]    
