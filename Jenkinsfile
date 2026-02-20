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
        bat 'docker compose up -d'
        sleep 35
    }
    
    stage('Check') {
        bat 'docker ps'
        
        retry(3) {
            sleep 5
            bat 'curl -f http://localhost:5173 || exit /b 1' 
        }

        retry(3) {
            sleep 5
            bat 'curl -f http://localhost:8000 || exit /b 1' 
        }
    }
 
 

    stage('Done') {
            echo """
        ===================[ RESTT - DÉPLOIEMENT RÉUSSI ]=================== 
            >>> ACCÈS APPLICATION :
                - Frontend : http://localhost:5173
                - Service  : http://localhost:8000 

        =================== [ SYSTÈME PRÊT POUR LA PRODUCTION ] ===================

            --- Nuno LEFORT

        ================================================================="""
    }
    
}
