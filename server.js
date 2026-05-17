const express = require('express')

const sql = require('mssql')

const cors = require('cors')

const bodyParser = require('body-parser')

const app = express()


// MIDDLEWARES
app.use(cors())

app.use(bodyParser.json())

app.use(express.static('public'))


// CONFIG AZURE SQL
const config = {

    user: 'ninzgx',

    password: 'Senha123!',

    server: 'serverninzgx.database.windows.net',

    database: 'EscolaABC',

    options: {

        encrypt: true,

        trustServerCertificate: false
    }
}


// CONEXÃO SQL
sql.connect(config)

.then(() => {

    console.log(
        'Conectado ao Azure SQL'
    )

})

.catch((erro) => {

    console.log(
        'Erro ao conectar no Azure'
    )

    console.log(erro)
})


// TESTE SERVIDOR
app.get('/teste', (req, res) => {

    res.json({

        sucesso: true,

        mensagem:
            'Servidor funcionando'
    })
})


// TESTE SQL
app.get('/sql', async (req, res) => {

    try {

        const resultado =
            await sql.query(
                'SELECT 1 AS teste'
            )

        res.json(resultado.recordset)

    }

    catch(erro){

        console.log(erro)

        res.status(500).json({

            erro: erro.message
        })
    }
})


// LOGIN (CORRIGIDO)
app.post('/login', async (req, res) => {
    try {
        // DADOS DO FRONTEND
        const { matricula, senha, tipo } = req.body

        // LOGS TERMINAL
        console.log('Matricula:', matricula)
        console.log('Senha:', senha)
        console.log('Tipo:', tipo)

        // DEFINE TABELA (Corrigido para usar sempre minúsculo)
        let tabela = ''
        if (tipo === 'Aluno') {
            tabela = 'Alunos'
        } else {
            tabela = 'Professores'
        }

        // REQUEST SQL
        const request = new sql.Request()

        // PARÂMETROS
        request.input('matricula', sql.VarChar, matricula)
        request.input('senha', sql.VarChar, senha)

        // CONSULTA
        const resultado = await request.query(`
            SELECT *
            FROM ${tabela}
            WHERE Matricula = @matricula
            AND Senha = @senha
        `)

        // LOG SQL
        console.log(resultado.recordset)

        // LOGIN OK
        if (resultado.recordset.length > 0) {
            const usuario = resultado.recordset[0]

            res.json({
                sucesso: true,
                mensagem: 'Login realizado com sucesso',
                usuario: {
                    nome: usuario.Nome,
                    matricula: usuario.Matricula,
                    tipo: tipo
                }
            })
        }
        // LOGIN INCORRETO
        else {
            res.json({
                sucesso: false,
                mensagem: 'Matrícula ou senha incorretas'
            })
        }

    } catch (erro) {
        console.log('Erro login:')
        console.log(erro)

        res.status(500).json({
            sucesso: false,
            erro: erro.message
        })
    }
})

// SERVIDOR
app.listen(3000, () => {

    console.log(
        'Servidor rodando em:'
    )

    console.log(
        'http://localhost:3000'
    )
})