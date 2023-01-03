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
                sh 'CYPRESS_CACHE_FOLDER=/tmp/ npm ci --force --unsafe-perm=true --allow-root'
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
                sshagent(credentials: ['Stu-Mgmt_Demo-System']) {
                    sh """
                        ssh -i ~/.ssh/id_rsa_student_mgmt_backend elscha@${env.DEMO_SERVER} <<EOF
                            cd /var/www/html2/WEB-APP || exit 1
                            rm -f -r *
                            exit
                        EOF
                    """
                    sh "scp -i ~/.ssh/id_rsa_student_mgmt_backend -r dist/apps/client/* elscha@${env.DEMO_SERVER}:/var/www/html2/WEB-APP"
                    sh """
                        ssh -i ~/.ssh/id_rsa_student_mgmt_backend elscha@${env.DEMO_SERVER} <<EOF
                            sed -i "s|window\\.__env\\.API_BASE_PATH = .*|window\\.__env\\.API_BASE_PATH = \\"${env.DEMO_SERVER_BACKEND_URL}\\";|g" /var/www/html2/WEB-APP/env.js
                            sed -i "s|window\\.__env\\.AUTH_ISSUER_URL = .*|window\\.__env\\.AUTH_ISSUER_URL = \\"${env.AUTH_ISSUER_URL}\\";|g" /var/www/html2/WEB-APP/env.js
                            sed -i "s|window\\.__env\\.AUTH_CLIENT_ID = .*|window\\.__env\\.AUTH_CLIENT_ID = \\"${env.AUTH_CLIENT_ID}\\";|g" /var/www/html2/WEB-APP/env.js
                            exit
                        EOF
                    """
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
