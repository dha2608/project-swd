# PowerShell Script de tao cau truc du an EVDMS MERN

Write-Host "--- Bat dau tao cau truc du an EVDMS MERN (ben trong thu muc hien tai) ---" -ForegroundColor Green

# 1. Tao thu muc goc cua du an va di vao do
# (Da xoa bo lenh 'mkdir evdms-mern-project' va 'cd evdms-mern-project')
# (Script nay se chay ngay ben trong thu muc hien tai cua ban)

# 2. === CAI DAT SERVER (BACKEND) ===
Write-Host "--- Dang thiet lap /server ---" -ForegroundColor Cyan
mkdir server
cd server

# 2.1. Khoi tao Node.js project (tao package.json)
npm init -y

# 2.2. Tao cau truc thu muc cho server
mkdir config, models, services, controllers, routes
Write-Host "Da tao cac thu muc: /config, /models, /services, /controllers, /routes"

# 2.3. Tao cac file rong (thay the cho 'touch')
New-Item -ItemType File "server.js"
New-Item -ItemType File ".env"
New-Item -ItemType File "config/db.js"
New-Item -ItemType File "models/customer.model.js"
New-Item -ItemType File "models/testDrive.model.js"
New-Item -ItemType File "models/feedback.model.js"
New-Item -ItemType File "services/crm.service.js"
New-Item -ItemType File "controllers/crm.controller.js"
New-Item -ItemType File "routes/crm.routes.js"
Write-Host "Da tao cac file he thong cho Server."

# 2.4. Quay lai thu muc goc
cd ..

# 3. === CAI DAT CLIENT (FRONTEND) ===
Write-Host "--- Dang thiet lap /client (Vui long cho, buoc nay co the mat vai phut...) ---" -ForegroundColor Cyan

# 3.1. Dung Create React App de tao cau truc client
npx create-react-app client

Write-Host "Da tao xong React App." -ForegroundColor Green

# 3.2. Di vao thu muc /src cua client
cd client/src

# 3.3. Tao cau truc thu muc cho client
mkdir components, services
Write-Host "Da tao cac thu muc: /components, /services"

# 3.4. Tao cac file rong
New-Item -ItemType File "services/api.js"
New-Item -ItemType File "components/TestDriveForm.js"
New-Item -ItemType File "components/FeedbackForm.js"
Write-Host "Da tao cac file he thong cho Client."

# 4. Quay lai thu muc goc
cd ../..

Write-Host "=== HOAN TAT! Cau truc thu muc MERN da san sang. ===" -ForegroundColor Green
Write-Host "Buoc tiep theo:"
Write-Host "1. Chay 'npm install' trong ca 2 thu muc /server va /client."
Write-Host "2. Dan code tu cac file toi da cung cap vao cac file rong tuong ung."