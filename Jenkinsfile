pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        git branch: 'deploy', url: 'https://github.com/dali-helal/ia_assistant.git'
      }
    }
    
    stage('Install Dependencies') {
      steps {
        bat 'npm ci'
      }
    }
    
    stage('Run Tests') {
      steps {
        bat 'npm test'
      }
    }

    stage('Build') {
      steps {
        bat 'npm run build'
      }
    }
    
    stage('Build Docker Image') {
      steps {
        script {
          docker.build("vite-react-ts:${env.BUILD_NUMBER}")
        }
      }
    }
    
    stage('Push Docker Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          bat """
            echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
            docker push vite-react-ts:${env.BUILD_NUMBER}
          """
        }
      }
    }
  }
  
  post {
    always {
      cleanWs()
    }
  }
}
