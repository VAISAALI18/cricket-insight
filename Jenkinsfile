pipeline {
    agent any

    environment {
        IMAGE_NAME    = "vaisaali18/cricket-insight"
        IMAGE_TAG     = "${env.BUILD_NUMBER}"
        SONAR_PROJECT = "cricket-insight"
        REGISTRY      = "docker.io"
	SONAR_SCANNER_HOME = tool 'SonarScanner'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Code checked out from branch: ${env.BRANCH_NAME}"
            }
        }

        stage('Install & Unit Test') {
	    steps {
        	sh '''
            	python3 -m venv venv
            	. venv/bin/activate

            	pip install --upgrade pip
            	pip install -r requirements.txt

            	pytest tests/ -v \
                	--tb=short \
                	--junitxml=test-results.xml \
                	--cov=backend \
                	--cov-report=xml:coverage.xml \
                	--cov-report=term-missing
        	'''
    		}

    post {
        always {
            junit 'test-results.xml'
        }
    }
}
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('My Sonar Server') {
                   sh """
    			${SONAR_SCANNER_HOME}/bin/sonar-scanner \
    			-Dsonar.projectKey=${SONAR_PROJECT} \
    			-Dsonar.sources=. \
    			-Dsonar.exclusions=**/tests/**,**/__pycache__/**,**/frontend/** \
    			-Dsonar.python.coverage.reportPaths=coverage.xml \
    			-Dsonar.python.xunit.reportPath=test-results.xml
		   """  
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Trivy Security Scan') {
            steps {
                sh '''
                    trivy image \
                        --exit-code 1 \
                        --severity CRITICAL \
                        --format table \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${IMAGE_NAME}:latest
                    '''
                }
            }
        }

        stage('Update K8s Manifests') {
            steps {
                sh """
                    sed -i 's|image: ${IMAGE_NAME}:.*|image: ${IMAGE_NAME}:${IMAGE_TAG}|' \
                        manifests/deployment.yaml
                    git config user.email "jenkins@cricket-insight.local"
                    git config user.name "Jenkins"
                    git add manifests/deployment.yaml
                    git diff --staged --quiet || \
                        git commit -m "ci: update image tag to ${IMAGE_TAG} [skip ci]"
                """
                withCredentials([usernamePassword(
                    credentialsId: 'github-creds',
                    usernameVariable: 'GH_USER',
                    passwordVariable: 'GH_PASS'
                )]) {
                    sh "git push https://${GH_USER}:${GH_PASS}@github.com/VAISAALI18/cricket-insight.git main"
                }
            }
        }
    }

    post {
        success {
            echo "🚀 Pipeline PASSED — Image: ${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo "❌ Pipeline FAILED — Check logs above"
        }
        always {
            sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true"
        }
    }
}
