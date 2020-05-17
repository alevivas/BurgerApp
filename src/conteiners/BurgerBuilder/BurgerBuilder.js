import React , {Component} from 'react';

import Auxiliar from '../../hoc/Auxiliar';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner'
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler'

const INGREDIENTS_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
}

class BurgerBuilder extends Component {

    state = {        
        totalPrice : 0,
        purchaseble: false,
        purchasing : false, 
        loading: false,
        error: false
    }

    componentDidMount () {
        axios.get('https://burgerapp-e4e67.firebaseio.com/ingredients.json')
            .then(response => {
                this.setState({ingredients: response.data})
                // console.log(response.data);
            })
            .catch(error => {
                this.setState({error: true});
            });            
    }

    updatePurchaseState (ingredients) {
     
        const sum = Object.keys(ingredients)
            .map(igKey => {
                return ingredients[igKey];
            })
            .reduce((sum,el) => {
                return sum + el;
            },0);
        this.setState({purchaseble : sum > 0});
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updateCounted = oldCount + 1;
        const updateIngredients = {
            ...this.state.ingredients
        };
        updateIngredients[type] = updateCounted;
        const priceAddition = INGREDIENTS_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({totalPrice: newPrice, ingredients:updateIngredients});
        this.updatePurchaseState(updateIngredients);

    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if(oldCount <= 0){
            return;
        }
        const updateCounted = oldCount -1;
        const updateIngredients = {
            ...this.state.ingredients
        };
        updateIngredients[type] = updateCounted;
        const priceAddition = INGREDIENTS_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceAddition;
        this.setState({totalPrice: newPrice, ingredients:updateIngredients});
        this.updatePurchaseState(updateIngredients);
    }

    purchasingHandler = () =>{
        this.setState({purchasing : true});
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing : false});
    }

    purchaseContinueHandler = () => {
        //alert('You continue !');
        this.setState({loading:true});
        const order = {
            ingredients : this.state.ingredients,
            price: this.state.totalPrice,
            customer: {
                name: 'Ale campeon del mundo',
                address: {
                    calle: 'costa rica',
                    esq: 'cooper',
                    pais: 'Uru'
                },
                email:'ale@gmail.com'
            }
        }
        axios.post('/orders.json', order)
        .then(response => {
            this.setState({ loading : false , purchasing : false})
        })
        .catch(error => {
            this.setState({ loading : false , purchasing : false})
        });
    }

    render () {

        const disableInfo = {
            ...this.state.ingredients
        };

        for (let key in disableInfo){
            disableInfo[key] = disableInfo[key] <=  0;
        }

        let orderSummary = null;
        let burger = this.state.error ? <p> ingredients cant be loaded </p> :<Spinner />;

        if(this.state.ingredients){
            burger = (
                <Auxiliar>
                    <Burger ingredients = {this.state.ingredients}/>
                    <BuildControls
                        ingredientAdded= {this.addIngredientHandler}
                        ingredientRemove={this.removeIngredientHandler}
                        disabled={disableInfo}
                        price={this.state.totalPrice}
                        ordered={this.purchasingHandler}
                        purchaseble={this.state.purchaseble}/>
                </Auxiliar>
            );
            orderSummary = <OrderSummary 
                price={this.state.totalPrice}
                ingredients={this.state.ingredients}
                purchaseCanceled={this.purchaseCancelHandler}
                purchaseContinue={this.purchaseContinueHandler}/>
        }
        
        if(this.state.loading){
            orderSummary = <Spinner />;
        }


        return (
            <Auxiliar>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>

             {burger}
            </Auxiliar>
        );
    }


}

export default withErrorHandler(BurgerBuilder, axios);