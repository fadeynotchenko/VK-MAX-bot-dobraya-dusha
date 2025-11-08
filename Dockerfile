FROM node:20-bullseye

WORKDIR /app

# Root dependencies
COPY package*.json ./
RUN npm install

# Frontend dependencies
COPY max-web/package*.json max-web/
RUN npm install --prefix max-web

# Application source
COPY . .

RUN chmod +x start.sh

EXPOSE 8788 4173

CMD ["./start.sh"]
