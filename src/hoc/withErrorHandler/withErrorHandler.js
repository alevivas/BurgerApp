import React, { Component } from 'react';
import Modal from '../../components/UI/Modal/Modal';
import Auxiliar from '../Auxiliar'
import BurgerIngredient from '../../components/Burger/BurgerIngredient/BurgerIngredient';

const withErrorHandler = (WrappedComponent, axios) => {

    return class extends Component {
        state = {
            error: null
        }
        componentWillMount () {
            this.reqInterceptor = axios.interceptors.request.use(req => {
                this.setState({error: null});
                return req;
            })
            this.resInterceptor = axios.interceptors.response.use(res => res, error => {
                this.setState({error: error});
            });
        }

        componentWillUnmount() {
            axios.interceptors.request.eject(this.reqInterceptor);
            axios.interceptors.response.eject(this.reqInterceptor);
        }

        errorConfirmedHandler = () => {
            this.setState({error: null});
        }
    
        render() {
            return (
                <Auxiliar>
                    <Modal
                        show={this.state.error}
                        modalClosed={this.errorConfirmedHandler}>
                            {this.state.error ? this.state.error.message : null}
                    </Modal>
                    <WrappedComponent {...this.props}/>
                </Auxiliar>
            );
        }
    }
    
}

export default withErrorHandler;