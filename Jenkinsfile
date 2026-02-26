node {

    def SERVER = "ubuntu@16.16.201.152"

    stage('Clone') {   
        checkout scm 
        bat 'dir' 
    } 

    stage('Build') {  
        withCredentials([string(credentialsId: 'GROQ_API_KEY', variable: 'GROQ_API_KEY'), string(credentialsId: 'REACT_APP_API_TOKEN', variable: 'REACT_APP_API_TOKEN')]) {
            bat 'docker compose down -v' 
            // bat 'docker compose build --no-cache' 
            // bat 'docker compose up -d' 
            bat 'docker compose up -d --build' 
        }     
        sleep 40
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

    stage('Restitution') {
        bat '''
        curl -f -X POST http://localhost:8000/token/ -H "Content-Type: application/json" -d "{\\"username\\": \\"trofel\\", \\"password\\": \\"Trofel.@#\\"}" > token.json  

        for /f "delims=" %%i in ('powershell -Command "(Get-Content token.json | ConvertFrom-Json).access"') do set ACCESS_TOKEN=%%i

        echo $token = $env:ACCESS_TOKEN > send.ps1
        echo $data = Get-Content restt.json ^| ConvertFrom-Json >> send.ps1
        echo foreach ($item in $data) { >> send.ps1
        echo     $json = $item ^| ConvertTo-Json -Depth 20 >> send.ps1
        echo     Invoke-RestMethod -Uri "http://localhost:8000/api/restitutions/" -Method Post -Headers @{ Authorization = "Bearer " + $token } -ContentType "application/json" -Body $json >> send.ps1
        echo } >> send.ps1

        powershell -NoProfile -ExecutionPolicy Bypass -File send.ps1

        del send.ps1
        del token.json
        '''
    }

    stage('Entrepot') {
        bat '''
        echo === Import SQL into Postgres Docker ===

        docker cp restt.sql restt-dbb-1:/restt.sql

        docker exec -i restt-dbb-1 psql -U postgres -d iris_restitution -f /restt.sql

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

    stage('Prepare EC2') {
        withCredentials([file(credentialsId: 'ec2-pem', variable: 'PEM_FILE')]) {

            bat """
            ssh -i %PEM_FILE% -o StrictHostKeyChecking=no ${SERVER} mkdir -p /home/ubuntu/aws_restitution
            """

            bat """
            scp -i %PEM_FILE% -o StrictHostKeyChecking=no aws_restt\\docker-compose.yml ${SERVER}:/home/ubuntu/aws_restitution/docker-compose.yml
            """ 

            bat """
            scp -i %PEM_FILE% -o StrictHostKeyChecking=no nginx\\conf\\nginx.conf ${SERVER}:/home/ubuntu/aws_restitution/nginx/conf/nginx.conf 
            """ 
            
            // bat """
            // sudo scp -i %PEM_FILE% -o StrictHostKeyChecking=no nginx\\conf\\nginx.conf ${SERVER}:/etc/nginx/conf/nginx.conf 
            // """ 

            bat """
            scp -i %PEM_FILE% -o StrictHostKeyChecking=no restt.sql ${SERVER}:/home/ubuntu/aws_restitution/restt.sql
            """

            bat """
            scp -i %PEM_FILE% -o StrictHostKeyChecking=no restt.json ${SERVER}:/home/ubuntu/aws_restitution/restt.json
            """
        }
    } 

    stage('Push Images') {
        withCredentials([usernamePassword(
            credentialsId: 'gitlab-registry2',
            usernameVariable: 'REG_USER',
            passwordVariable: 'REG_PASS'
        )]) {

            bat "docker login registry.gitlab.com -u %REG_USER% -p %REG_PASS%"
                        
            bat "docker tag restt-backendd registry.gitlab.com/lefortnuno/restitution_iris/backend:latest || exit /b 1"
            bat "docker tag restt-frontendd registry.gitlab.com/lefortnuno/restitution_iris/frontend:latest || exit /b 1" 
            bat "docker tag restt-nginx registry.gitlab.com/lefortnuno/restitution_iris/nginx:latest || exit /b 1"

            bat "docker push registry.gitlab.com/lefortnuno/restitution_iris/backend:latest || exit /b 1"
            bat "docker push registry.gitlab.com/lefortnuno/restitution_iris/frontend:latest || exit /b 1"
            bat "docker push registry.gitlab.com/lefortnuno/restitution_iris/nginx:latest || exit /b 1"
        }
    }
 
    stage('Trigger GitLab Deploy') {
        withCredentials([string(credentialsId: 'gitlab-trigger-token', variable: 'TRIGGER_TOKEN')]) {
            bat """
            curl -X POST -F "token=%TRIGGER_TOKEN%" -F "ref=main" https://gitlab.com/api/v4/projects/79733394/trigger/pipeline || exit /b 1
            """
        }
    }

    stage('Init Prod') {
        sleep 30

        withCredentials([file(credentialsId: 'ec2-pem', variable: 'PEM_FILE')]) {  
            bat """
            ssh -i %PEM_FILE% ${SERVER} "cd /home/ubuntu/aws_restitution && docker cp /home/ubuntu/aws_restitution/restt.sql restt-postgres:/restt.sql && docker exec -i restt-postgres psql -U postgres -d iris_restitution -f /restt.sql"
            """
            
            sleep 2 
            bat """
            ssh -i %PEM_FILE% -o StrictHostKeyChecking=no ${SERVER} "docker exec restt-backend python manage.py shell -c \\"from django.contrib.auth import get_user_model; User = get_user_model(); user, created = User.objects.get_or_create(username='trofel', email='trofel.2025@gmail.com'); user.set_password('Trofel.@#'); user.is_superuser=True; user.is_staff=True; user.save(); print('Superuser created or updated')\\""
            """

            sleep 2 
            bat """
            ssh -i %PEM_FILE% -o StrictHostKeyChecking=no ${SERVER} "cd /home/ubuntu/aws_restitution && ./init_prod.sh"
            """ 
        }
    }  

}
