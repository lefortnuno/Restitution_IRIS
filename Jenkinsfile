node {

    stage('Clone') {   
        checkout scm 
        bat 'dir' 
    } 

    stage('Build') {  
        bat 'docker compose down -v'
        withCredentials([string(credentialsId: 'GROQ_API_KEY', variable: 'GROQ_API_KEY')]) {
            bat 'docker compose up -d --build'
        }     
        // sleep 40
    }

    stage('SuperUser') { 
        bat """
            docker exec restt-backendd-1 python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings'); django.setup(); from django.contrib.auth import get_user_model; User = get_user_model(); user, created = User.objects.get_or_create(username='trofel', email='trofel.2025@gmail.com'); user.set_password('Trofel.@#'); user.is_superuser=True; user.is_staff=True; user.save()"
        """ 
    }

    stage('Check') {
        bat 'docker ps'
        
        retry(3) {
            sleep 5
            bat 'curl -f http://localhost:5173 || exit /b 1' 
        }

        retry(3) {
            sleep 5
            bat 'curl http://localhost:8000/api/users/?format=json || exit /b 1'  
        }

    }

    // stage('Restt') { 
    //     bat '''  
    //     curl -f -X POST http://localhost:8000/token/ -H "Content-Type: application/json" -d "{\\"username\\": \\"trofel\\", \\"password\\": \\"Trofel.@#\\"}" > token.json  
  
    //     for /f "delims=" %%i in ('powershell -Command "(Get-Content token.json | ConvertFrom-Json).access"') do set ACCESS_TOKEN=%%i
 
    //     curl -f -X POST http://localhost:8000/api/restitutions/ ^
    //         -H "Content-Type: application/json" ^
    //         -H "Authorization: Bearer %ACCESS_TOKEN%" ^
    //         -d "{\\"nom\\":\\"Moyenne Global Montant Impayé par Flag\\",\\"formats_selected\\":[],\\"jointures\\":[],\\"affichages\\":[{\\"nom_affichage\\":\\"Diagramme circulaire\\"}],\\"filtres_pop\\":[],\\"conditions\\":[],\\"operation_selected\\":[],\\"champs\\":[]}"

    //     del token.json 
    //     '''
    // }

    stage('Restt') { 
        bat '''
        curl -f -X POST http://localhost:8000/token/ -H "Content-Type: application/json" -d "{\\"username\\": \\"trofel\\", \\"password\\": \\"Trofel.@#\\"}" > token.json  

        for /f "delims=" %%i in ('powershell -Command "(Get-Content token.json | ConvertFrom-Json).access"') do set ACCESS_TOKEN=%%i

        powershell -NoProfile -ExecutionPolicy Bypass -Command "
            $token = $env:ACCESS_TOKEN
            $data = Get-Content restt.json | ConvertFrom-Json

            foreach ($item in $data) {
                $json = $item | ConvertTo-Json -Depth 20

                Invoke-RestMethod `
                    -Uri 'http://localhost:8000/api/restitutions/' `
                    -Method Post `
                    -Headers @{ Authorization = 'Bearer ' + $token } `
                    -ContentType 'application/json' `
                    -Body $json
            }
        "

        del token.json
        '''
    }

    stage('Entrepot') {
        bat '''
        echo === Import SQL into Postgres Docker ===

        docker cp restt.sql dbb-1:/restt.sql

        docker exec -i dbb-1 psql -U postgres -d postgres -f /restt.sql

        echo === Postgres tables created ===
        '''
    }

    stage('Done') { 
                    echo """
            ==================[ RESTT - DEPLOIEMENT REUSSI ]===================

            Frontend : http://localhost:5173
            Backend  : http://localhost:8000

            ===================================================================
                    """
    }
    
}
