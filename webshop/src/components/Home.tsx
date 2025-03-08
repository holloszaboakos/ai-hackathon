import {
    addToCart,  selectCart
} from "./reducers/cartReducer";

import { useAppSelector, useAppDispatch } from '../hooks'

import './reducers/cartReducer';
import { Link } from "react-router";

const  Home = () => {

    const dispatch = useAppDispatch()
    const cart = useAppSelector(selectCart)

    let itemList = cart.items.map(item => {
        return (
            <div className="card" key={item.id}>
                <div className="card-image">
                    <img src={item.img} alt={item.title} />
                    <span className="card-title">{item.title}</span>
                    <Link
                        to="/"
                        className="btn-floating halfway-fab waves-effect waves-light red"
                        onClick={() => { dispatch(addToCart(item.id)) }}>
                        <i className="material-icons">add</i></Link>
                </div>

                <div className="card-content">
                    <p>{item.desc}</p>
                    <p><b>Price: {item.price}$</b></p>
                </div>
            </div>

        )
    })

    return (
        <div className="container">
            <h3 className="center">Our items</h3>
            <div className="box">
                {itemList}
            </div>
        </div>
    )

}

export default Home;