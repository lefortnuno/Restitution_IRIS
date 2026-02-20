node {

    stage('Clone') {   
        checkout scm 
        bat 'dir'
        bat 'echo %GROQ_API_KEY%'
    } 

    stage('Build') {  
        bat 'docker compose down -v'
        withCredentials([string(credentialsId: 'GROQ_API_KEY', variable: 'GROQ_API_KEY')]) {
            bat 'docker compose up -d --build'
        }     
        sleep 35
    }

    stage('SuperUser') {
        steps {
            bat """
            docker exec restt-backendd-1 python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings'); django.setup(); from django.contrib.auth import get_user_model; User = get_user_model(); user, created = User.objects.get_or_create(username='trofel', email='trofel.2025@gmail.com'); user.set_password('Trofel.@#'); user.is_superuser=True; user.is_staff=True; user.save()"
            """
        }
    }

    stage('Check') {
        bat 'docker ps'
        
        retry(3) {
            sleep 5
            bat 'curl -f http://localhost:5173 || exit /b 1' 
        }

        retry(3) {
            sleep 5
            bat 'curl -f http://localhost:8000/api/users || exit /b 1' 
        }

        bat 'docker exec restt-backendd-1 printenv GROQ_API_KEY'
    }
    

    stage('Auth') {
        steps {
            bat '''
            REM Retry 3 fois pour attendre que le backend soit prêt
            set RETRY=0
            :WAIT_LOOP
            curl -f -X POST http://localhost:8000/token/ -H "Content-Type: application/json" -d "{\\"username\\": \\"trofel\\", \\"password\\": \\"Trofel.@#\\"}" > token.json
            if %ERRORLEVEL% neq 0 (
                set /a RETRY+=1
                if %RETRY% leq 3 (
                    timeout /t 5
                    goto WAIT_LOOP
                ) else (
                    echo "Backend non disponible après 3 essais"
                    exit /b 1
                )
            )

            REM Extraire le access token depuis le JSON et mettre dans le .env du frontend
            for /f "delims=" %%i in ('powershell -Command "(Get-Content token.json | ConvertFrom-Json).access"') do set ACCESS_TOKEN=%%i
            echo REACT_APP_API_TOKEN=%ACCESS_TOKEN% > ../restitution_ui/.env

            REM Nettoyage
            del token.json
            '''
        }
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
