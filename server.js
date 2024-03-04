// 安裝套件 npm init / npm install uuid
// node.js內部套件
const http =require('http')
// npm外部套件
const {v4: uuidv4} =require('uuid')
//  自己寫的套件
const errorHandle =require('./errorHandle')

// [Request Method]
// OPTIONS：回傳這個伺服器支援的所有HTTP Method。
// GET：向指定的資源發出「顯示」請求。
// POST：向指定資源提交資料，並且Body中可帶傳輸的資料。
// DELETE：刪除指定的資源。
// PATCH：更換資源部分內容
// PUT：替換資源

// 1. create server
// 2. 安裝套件： node init / npm install uuid
// 3. 建立五種method(OPTIONS / GET / POST / DELETE / PATCH)並用POSTMAN測試是否能回傳資料
// 4. 將錯誤處理函式寫成套件並導入
// 5. 建立POST
// 5-1. 觸發on function，接收POST method回傳的資料
// 5-2. 把on("end")回傳的資料，寫回todos
// 5-3. 幫每一筆資料建立uuid
// 5-4. 錯誤排除：body不是JSON格式 / 物件屬性格式不正確
// 6. 建立DELETE
// 6-1. 刪除全部 todos.length = 0
// 6-2. 逐筆刪除 
// 6-2-1. 建立 id & index
// 6-2-2. 若todos中有值，刪除該筆資料
// 7. 建立PATCH
// 7-1. 建立 id & index & title
// 7-2. 把on("end")回傳的資料，寫回todos
// 7-3. 錯誤排除：body不是JSON格式 / 物件屬性格式不正確

const todos = []
const requestListener = (req,res) =>{
    console.log(req.url.split('/').pop())
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }
    let body =''
    let num = 0
    req.on('data',chunk =>{
        body += chunk
        num += 1
        console.log(body , num)
    })
    if(req.url == '/todos' && req.method == "GET"){
        res.writeHead(200,headers)
        res.write(JSON.stringify({
            'status': 'success',
            'data': todos,
            'method': 'GET'
        }))
        res.end()
    }else if(req.method =="OPTIONS"){
        res.writeHead(200,headers)
        res.write(JSON.stringify({
            'status': 'success',
            'data': todos,
            'method': 'OPTIONS'
        }))
        res.end()
    }else if(req.url == '/todos' && req.method =="POST"){
        req.on('end',()=>{
            // 除錯: 1.確認JSON格式 2.確認屬性格式
            try{
            const title = JSON.parse(body).title
            if(title !== undefined){
                const todo ={
                    'title': title,
                    'id': uuidv4()
                }
                todos.push(todo)
                res.writeHead(200,headers)
                res.write(JSON.stringify({
                    'status': 'success',
                    'data': todos,
                    'method': 'POST'
                }))
                res.end()
            }else{
                errorHandle(res)
            }
            }catch(error){
                errorHandle(res)
            }
        })

    }else if(req.url == '/todos' && req.method =="DELETE"){
        todos.length =0
        res.writeHead(200,headers)
        res.write(JSON.stringify({
            'status': 'success',
            'data': todos,
            'method': 'DELETE'
        }))
        res.end()
    }else if(req.url.startsWith('/todos/') && req.method =="DELETE"){
        const id = req.url.split('/').pop()
        const index = todos.findIndex(element => element.id ==id)
        if(index != -1){
            todos.splice(index,1)
            res.writeHead(200,headers)
            res.write(JSON.stringify({
                'status': 'success',
                'data': todos,
                'method': 'DELETE-single'
            }))
            res.end()
        }else{
            errorHandle(res)
        }
    }else if(req.url.startsWith('/todos/') && req.method =="PATCH"){
        req.on('end',()=>{
            try{
                const title = JSON.parse(body).title
                const id = req.url.split('/').pop()
                const index = todos.findIndex(element => element.id == id)
                if(index !== -1 && title !== undefined){
                    todos[index].title = title
                    res.writeHead(200,headers)
                    res.write(JSON.stringify({
                        'status':'succes',
                        'method':'PATCH',
                        'data': todos,
                        'patched-id': id,
                        'patched-index': index,
                        'patched-title': title
                    }))
                    res.end()
            }else{
                errorHandle(res)
            }
            }catch(error){
                errorHandle(res)
            }

        })
    }
    else{
        errorHandle(res)
    }
    
}

const server = http.createServer(requestListener)
server.listen(process.env.PORT||8000)