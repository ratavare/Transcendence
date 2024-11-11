GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
NC = \033[0m

all: build

build:
	@echo "$(GREEN)Docker Compose Starting!$(NC)"
	@docker-compose -f docker-compose.yml up --build

clean:
	@echo "$(RED)Cleaning up containers and volumes...$(NC)"
	@docker-compose -f docker-compose.yml down --volumes --rmi all

pyclean:
	@find . -type d -name __pycache__ -exec rm -r {} \+

fclean: clean pyclean
	@echo "$(RED)System pruning...$(NC)"
	@docker system prune -af --volumes --force

re: fclean build

.PHONY: all build dirs secrets stop clean fclean re