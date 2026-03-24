.PHONY: help install test run lint format clean docker-build docker-up docker-down

help:
	@echo "Rho 投研 Agent - 可用命令"
	@echo "========================"
	@echo "make install       - 安装依赖 (后端 + 前端)"
	@echo "make test          - 运行测试"
	@echo "make test-cov      - 运行测试 (带覆盖率)"
	@echo "make run           - 运行后端 API"
	@echo "make run-cli       - 运行 CLI"
	@echo "make env-check     - 检查环境变量"
	@echo "make lint          - 代码检查"
	@echo "make format        - 代码格式化"
	@echo "make clean         - 清理临时文件"
	@echo "make docker-build - 构建 Docker 镜像"
	@echo "make docker-up      - 启动 Docker 容器"
	@echo "make docker-down   - 停止 Docker 容器"
	@echo "make frontend-install - 仅安装前端依赖"
	@echo "make frontend-run    - 运行前端开发服务器"

install:
	pip install -r requirements.txt
	cd frontend && npm install && cd ..

frontend-install:
	cd frontend && npm install && cd ..

test:
	pytest tests/ -v

test-cov:
	pytest tests/ -v --cov=backend --cov-report=html --cov-report=term

run:
	python -m backend.api.research

run-cli:
	python -m backend.cli $(ARGS)

env-check:
	python -m backend.cli env-status

lint:
	ruff check backend/
	cd frontend && npm run lint

format:
	ruff format backend/

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/.next
	rm -rf frontend/out
	rm -rf logs/*.log
	rm -f .coverage

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

# 开发辅助
dev: install run
	@echo "启动后端 API..."

frontend-run:
	cd frontend && npm run dev

# 清理所有构建产物
dist-clean: clean
	rm -rf build/ dist/ *.egg-info
	rm -rf frontend/build
