pipeline {
  agent none

  environment {
    DEMO_SERVER = '147.172.178.30'
    DEMO_SERVER_PORT = '8080'
  }

  options {
    ansiColor('xterm')
  }
  
  stages {
    stage("Node") {
      agent {
        docker {
          image 'node:18-bullseye'
          label 'docker'
          reuseNode true
          args '--tmpfs /.cache --tmpfs /.npm'
        }
      }
      stages {
        stage('Install Dependencies') {
          steps {
              sh 'npm ci --force'
          }
        }
        
        stage('Compilation Test') {
          steps {
            sh 'cp -f .env.example .env'
            sh 'npm run build'
          }
        }
      }
    } 
    
    stage('Test') {
      agent {
        label 'docker'
      }
      environment {
          POSTGRES_DB = 'SelfLearningDb'
          POSTGRES_USER = 'username'
          POSTGRES_PASSWORD = 'password'
          PORT = '5432'
          DATABASE_URL = "postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@localhost:${env.PORT}/${env.POSTGRES_DB}"
      }
      steps {
        script {
          // Sidecar Pattern: https://www.jenkins.io/doc/book/pipeline/docker/#running-sidecar-containers
          docker.image('postgres:14.3-alpine').withRun("-e POSTGRES_USER=${env.POSTGRES_USER} -e POSTGRES_PASSWORD=${env.POSTGRES_PASSWORD} -e POSTGRES_DB=${env.POSTGRES_DB} -p ${env.PORT}:${env.PORT}") { c ->
              sh "docker inspect ${c.id}"
              sh "sleep 20"
              sh 'npm run prisma db push'
              sh 'npm run test:ci'
          }
        }
      }
    }
    
    stage('Docker') {
      agent {
        label 'docker'
      }
      steps {
        sh 'mv docker/Dockerfile Dockerfile'
      }
    }
    
    stage('Deploy') {
      agent {
        label 'docker'
      }
      steps {
        sshagent(['STM-SSH-DEMO']) {
          sh "ssh -o StrictHostKeyChecking=no -l elscha ${env.DEMO_SERVER} echo ok"
        }
        findText(textFinders: [textFinder(regexp: '(- error TS\\*)|(Cannot find module.*or its corresponding type declarations\\.)', alsoCheckConsoleOutput: true, buildResult: 'FAILURE')])
      }
    }
  }
}
