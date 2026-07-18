FROM python:3.12-slim

# Install system dependencies required for LaTeX and compiling
RUN apt-get update && apt-get install -y \
    wget \
    perl \
    xz-utils \
    fontconfig \
    libfontconfig1 \
    make \
    && rm -rf /var/lib/apt/lists/*

# Install TinyTeX (A minimal, lightweight LaTeX distribution perfect for containers)
RUN wget -qO- "https://yihui.org/tinytex/install-bin-unix.sh" | sh

# Add TinyTeX to PATH
ENV PATH="/root/.TinyTeX/bin/x86_64-linux:${PATH}"

# Install rendercv required LaTeX packages automatically
RUN tlmgr update --self \
    && tlmgr install \
    etoolbox \
    xcolor \
    hyperref \
    fontawesome5 \
    microtype \
    pgf \
    geometry \
    fancyhdr \
    titlesec \
    enumitem \
    iftex \
    tools

WORKDIR /app

# Install Python dependencies
RUN pip install --no-cache-dir "rendercv[full]" fastapi uvicorn google-genai python-multipart

# Copy all backend code into the container
COPY . /app

EXPOSE 8000

# Start FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
