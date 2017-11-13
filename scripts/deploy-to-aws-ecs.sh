#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

# env vars: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION, ECS_CLUSTER, ECS_SERVICE, ECS_REPO

docker build . -t test

awsAccountId=$(aws sts get-caller-identity | sed s/\"/\\n/g | grep "^[0-9]*$")

imageVersion=travis-${TRAVIS_BUILD_NUMBER}-${TRAVIS_COMMIT}
imageName=${awsAccountId}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${ECS_REPO}:${imageVersion}

$(aws ecr get-login --region $AWS_DEFAULT_REGION)

docker tag test:latest "$imageName"
docker push "$imageName"

task=$(printf '[{
  "name": "cattaz-container",
  "image": "%s",
  "essential": true,
  "memory": 256,
  "cpu": 0,
  "portMappings": [
    { "containerPort": 1234, "hostPort": 1234 },
    { "containerPort": 8080, "hostPort": 8080 }
  ]
}]' $imageName)

taskDefResponse=$(aws ecs register-task-definition --container-definitions "$task" --family "travis-${ECS_REPO}")
taskArn=$(echo $taskDefResponse | sed s/\"/\\n/g | grep ^arn:aws:ecs:)
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --task-definition $taskArn
