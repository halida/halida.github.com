FROM ubuntu:20.04 as base

SHELL [ "/bin/bash", "-c" ]
ENV SHELL=/bin/bash
ENV DEBIAN_FRONTEND noninteractive

# base packages
RUN apt update && \
    apt install -y \
    software-properties-common \
    build-essential \
    sudo git vim-tiny

# install rvm
RUN add-apt-repository ppa:rael-gc/rvm && \
    apt update && apt install -y rvm

# install rails dep
RUN apt install -y \
    libxml2-dev \
    libxslt1-dev \
    libyajl-dev

# ruby
ARG RUBY=ruby-2.5.9
ARG CACHE_URL=https://cache.ruby-china.org/pub/ruby
RUN echo "ruby_url=$CACHE_URL" > /usr/share/rvm/user/db && \
    groupadd rvm && \
    source /usr/share/rvm/scripts/rvm && \
    rvm fix-permissions system

# setup user
ARG DOCKER_USER=ubuntu
ARG UID=1000
ARG GID=1000
RUN echo set uid:$UID gid:$GID && \
    groupadd -f ubuntu -g $GID && \
    useradd -u $UID -g $GID -m $DOCKER_USER && \
    usermod -a -G rvm $DOCKER_USER && \
    usermod -a -G sudo $DOCKER_USER && \
    echo "$DOCKER_USER ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER $DOCKER_USER

RUN mkdir -p ~/apps/app && \
    cd ~/apps/app && \
    echo "source /usr/share/rvm/scripts/rvm" >> ~/.bash_profile && \
    source /usr/share/rvm/scripts/rvm && \
    newgrp rvm && \
    rvm install $RUBY && \
    rvm default $RUBY && \
    rvm use $RUBY

WORKDIR /home/$DOCKER_USER/apps/app
CMD ["whoami"]
