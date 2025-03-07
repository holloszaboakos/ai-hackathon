import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
    removeItem, addQuantity, subtractQuantity, selectCart
} from "./reducers/cartReducer";
import { useAppDispatch, useAppSelector } from '../hooks';
import { Recipe } from './Recipe';

const Cart = () => {

    const dispatch = useAppDispatch()
    const cart = useAppSelector(selectCart)

    let addedItems = cart.items.length ?
        (
            cart.addedItems.map(item => {
                return (

                    <li className="collection-item avatar" key={item.id}>
                        <div className="item-img">
                            <img src={item.img} alt={item.img} className="" />
                        </div>

                        <div className="item-desc">
                            <span className="title">{item.title}</span>
                            <p>{item.desc}</p>
                            <p><b>Price: {item.price}$</b></p>
                            <p>
                                <b>Quantity: {item.quantity}</b>
                            </p>
                            <div className="add-remove">
                                <Link to="/cart"><i className="material-icons" onClick={() => { dispatch(addQuantity(item.id)) }}>arrow_drop_up</i></Link>
                                <Link to="/cart"><i className="material-icons" onClick={() => { dispatch(subtractQuantity(item.id)) }}>arrow_drop_down</i></Link>
                            </div>
                            <button className="waves-effect waves-light btn pink remove" onClick={() => { dispatch(removeItem(item.id)) }}>Remove</button>
                        </div>

                    </li>

                )
            })
        ) :

        (
            <p>Nothing.</p>
        )
    return (
        <div className="container">
            <div className="cart">
                <h5>You have ordered:</h5>
                <ul className="collection">
                    {addedItems}
                </ul>
            </div>
            <Recipe />
        </div>
    )
}


export default Cart;