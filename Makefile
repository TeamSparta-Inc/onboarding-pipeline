#!make
TAG                         := $$(git log -1 --pretty=format:%h)
ECR_URI                     := 497217256558.dkr.ecr.ap-northeast-1.amazonaws.com

NAME_SERVER                 := onboarding-dev-server

ECR_ENDPOINT_SERVER         := ${ECR_URI}/${NAME_SERVER}

LOCAL_IMG_COMMIT_SERVER     := ${NAME_SERVER}:${TAG}
LOCAL_IMG_LATEST_SERVER     := ${NAME_SERVER}:latest

ECR_IMG_COMMIT_SERVER       := ${ECR_ENDPOINT_SERVER}:${TAG}
ECR_IMG_LATEST_SERVER       := ${ECR_ENDPOINT_SERVER}:latest


build:
	@docker build -t onboarding .;
	@docker tag ${LOCAL_IMG_COMMIT_SERVER} ${LOCAL_IMG_LATEST_SERVER};

	@if [ $$env != "local" ]; then\
        docker tag ${LOCAL_IMG_COMMIT_SERVER} ${ECR_IMG_COMMIT_SERVER};\
        docker tag ${LOCAL_IMG_COMMIT_SERVER} ${ECR_IMG_LATEST_SERVER};\
    fi

run:
	@echo $$env;
	@sh run.sh $$env;

push:
	@aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 497217256558.dkr.ecr.ap-northeast-2.amazonaws.com
	@docker push ${ECR_IMG_COMMIT_SERVER}
	@docker push ${ECR_IMG_LATEST_SERVER}

network:
	@sh create-network.sh

kill:
	@echo 'Killing container...'
	@docker-compose -f docker-compose-$$env.yaml -p template-backend-app down

delete:
	# latest 태그 제외하고 모든 이미지, 또는 none 삭제
	@docker rmi -f $$( docker images --format "{{.ID}} {{.Repository}} {{.Tag}}" | grep template-backend | awk '{print ($$2":"$$3)}')
	@docker rmi -f $$( docker images --format "{{.ID}} {{.Repository}} {{.Tag}}" | grep none | awk '{print $$1}')
	@docker rmi -f $$( docker images --format "{{.ID}} {{.Repository}} {{.Tag}}" | grep template-nginx | awk '{print ($$2":"$$3)}')