pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        BASE_URL = 'https://www.saucedemo.com'
        PLAYWRIGHT_BROWSERS_PATH = '0'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/qualitymastery/playwright-e2e-8layer-jenkins-allure-report.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                bat 'npx playwright install chromium --with-deps'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npx playwright test'
            }
            post {
                always {
                    junit testResults: 'test-results/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                bat 'allure generate allure-results --clean -o allure-report'
            }
        }
    }

    post {
        always {
            allure([
                includeProperties: false,
                jdk: '',
                results: [[path: 'allure-results']],
                reportBuildPolicy: 'ALWAYS',
                report: 'allure-report'
            ])

            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
        }

        success {
            echo 'All tests passed!'
        }

        failure {
            echo 'Tests failed — check Allure report for details.'
        }
    }
}
