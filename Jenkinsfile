pipeline {
    agent {
        docker {
            image 'node:18-bullseye'
            args '-u root:root'
        }
    }
    
    environment {
        DEMO_SERVER = '147.172.178.30'
        DEMO_SERVER_BACKEND_PORT = '3000'
        DEMO_SERVER_BACKEND_URL = "http://${env.DEMO_SERVER}:${env.DEMO_SERVER_BACKEND_PORT}"
        AUTH_CLIENT_ID = 'stmgmt-client'
        AUTH_ISSUER_URL = 'https://staging.sse.uni-hildesheim.de:8443/realms/test-ldap-realm/'
    }
    
    stages {

        stage('Install Dependencies') {
            steps {
                sh 'CYPRESS_CACHE_FOLDER=/tmp/.cache npm ci --force'
            }
        }
        
        stage('Build') {
            steps {
                sh 'rm -f Client*.tar.gz'
                
                // Build with base = /
                sh 'npm run build'
                sh 'tar czf Client-Root.tar.gz dist/apps/client/'
                
                // Build with base = WEB-APP (must be last for deployment)
                sh 'rm -f -r dist/'
                sh 'npm run build -- --base-href=/WEB-APP/ --deploy-url=/WEB-APP/'
                sh 'tar czf Client.tar.gz dist/apps/client/'
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'sed -i "s|window\\.__env\\.API_BASE_PATH = .*|window\\.__env\\.API_BASE_PATH = \\"${env.DEMO_SERVER_BACKEND_URL}\\";|g" dist/apps/client/env.js'
                sshagent(['STM-SSH-DEMO']) {
					sh 'sftp elscha@${env.DEMO_SERVER} <<< "rm /var/www/html2/WEB-APP/* && put dist/apps/client/*"'
                }
            }
        }
        
        stage('Publish Results') {
            steps {
                archiveArtifacts artifacts: '*.tar.gz'
            }
        }
    }
}
