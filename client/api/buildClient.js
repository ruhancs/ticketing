import axios from 'axios'

const buildClient = ({ req }) => {
  // verificar se a requisiçao veio do browser ou do server "window so existe no browser"
  if (typeof window === 'undefined') {
    // aqui esta no server 'pod container'

    return axios.create({
    // ingress-nginx =  kubectl get namespace
    // ingress-nginx-controller = kubectl get services -n ingress-nginx
        baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
        headers: req.headers
    })

  } else {
    // aqui esta no browser
    return axios.create({
        baseUrl: '/'
    })
  }
}

export default buildClient