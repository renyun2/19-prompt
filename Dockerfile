FROM node:20-alpine

# better-sqlite3 native module 编译依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json ./
COPY .npmrc ./

RUN npm install --registry https://registry.npmmirror.com

COPY . .

RUN npm run build

# 确保数据目录存在
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "server/test-server.js"]
