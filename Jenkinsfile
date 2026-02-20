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
        sleep 35
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

        retry(10) {
            sleep 5
            bat 'curl -f -X GET http://localhost:8000/api/users/?format=json || exit /b 1'  
        }

        bat 'curl http://localhost:8000/api/users/?format=json || exit /b 1'  

    }
    

    stage('Auth') { 
        bat ''' 
        :WAIT_LOOP
        curl -f -X POST http://localhost:8000/token/ -H "Content-Type: application/json" -d "{\\"username\\": \\"trofel\\", \\"password\\": \\"Trofel.@#\\"}" > token.json  

        for /f "delims=" %%i in ('powershell -Command "(Get-Content token.json | ConvertFrom-Json).access"') do set ACCESS_TOKEN=%%i
        
        echo REACT_APP_API_TOKEN=%ACCESS_TOKEN% > restitution_ui/.env
         
        type restitution_ui/.env 

        del token.json
        ''' 
    }

    // stage('Frontend Build') {

    //     dir('restitution_ui') {
    //         bat 'npm run build'
    //     }
    // }

    stage('Done') { 
                    echo """
            ==================[ RESTT - DEPLOIEMENT REUSSI ]===================

            Frontend : http://localhost:5173
            Backend  : http://localhost:8000

            ===================================================================
                    """
    }
    
}
