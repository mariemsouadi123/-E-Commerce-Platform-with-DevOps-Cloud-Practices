pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "mariemsouadi12189"
        FRONTEND_IMAGE = "project-frontend"
        BACKEND_IMAGE  = "project-backend"
        REGISTRY       = "docker.io"
    }

    stages {

        stage("Checkout Code") {
            steps {
                git branch: 'main',
                    url: 'https://github.com/mariemsouadi123/Ecommerce-Platform-with-DevOps-Cloud-Practices.git'
            }
        }

        stage("Build Frontend Image") {
            steps {
                script {
                    docker.build(
                        "${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${BUILD_NUMBER}",
                        "frontend"
                    )
                }
            }
        }

        stage("Build Backend Image") {
            steps {
                script {
                    docker.build(
                        "${DOCKERHUB_USER}/${BACKEND_IMAGE}:${BUILD_NUMBER}",
                        "backend"
                    )
                }
            }
        }

        stage("Push Images to Docker Hub") {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin

                        docker tag ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                                   ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:latest
                        docker tag ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${BUILD_NUMBER} \
                                   ${DOCKERHUB_USER}/${BACKEND_IMAGE}:latest

                        docker push ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:latest

                        docker push ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${DOCKERHUB_USER}/${BACKEND_IMAGE}:latest
                    """
                }
            }
        }

        stage("Deploy to Kubernetes with Helm") {
            steps {
                withCredentials([
                    file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')
                ]) {
                    sh """
                        export KUBECONFIG=\$KUBECONFIG_FILE

                        helm upgrade --install ecommerce ./helm \
                          --set frontend.image.repository=${DOCKERHUB_USER}/${FRONTEND_IMAGE} \
                          --set frontend.image.tag=${BUILD_NUMBER} \
                          --set backend.image.repository=${DOCKERHUB_USER}/${BACKEND_IMAGE} \
                          --set backend.image.tag=${BUILD_NUMBER}
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful!"
        }
        failure {
            echo "❌ Deployment failed!"
        }
    }
}
