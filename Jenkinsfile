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
    
    stage('Check') {
        bat 'docker ps'
        
        retry(3) {
            sleep 5
            bat 'curl -f http://localhost:5173 || exit /b 1' 
        }

        // retry(3) {
        //     sleep 5
        //     bat 'curl -f http://localhost:8000 || exit /b 1' 
        // }
        
        bat 'docker exec restt-backendd-1 printenv GROQ_API_KEY'
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
