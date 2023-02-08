// configuraçao para evitar que o next nao carregue as alteraçoes por estar em um container

module.exports = {
    webpack: (config) => {
      config.watchOptions.poll = 300;
      return config;
    },
  };