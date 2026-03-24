# Rho - Setup Configuration
# Python 包安装配置

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="rho-research-agent",
    version="0.1.0",
    author="Rho Team",
    author_email="rho@example.com",
    description="A smart investment research agent for ordinary investors",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/example/rho-research-agent",
    packages=find_packages(exclude=["tests", "tests.*"]),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Financial and Insurance Industry",
        "Topic :: Office/Business :: Financial :: Investment",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.10",
    install_requires=[
        "langgraph>=0.0.15",
        "langchain>=0.0.270",
        "langchain-core>=0.0.1",
        "langchain-openai>=0.0.2",
        "langchain-anthropic>=0.0.1",
        "langchain-google-genai>=0.0.1",
        "yfinance>=0.2.28",
        "pandas>=2.0.0",
        "flask>=3.0.0",
        "python-dotenv>=1.0.0",
        "requests>=2.31.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "ruff>=0.1.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "rho=backend.cli:main",
        ],
    },
)
