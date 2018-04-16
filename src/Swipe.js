import React, {Component} from 'react';
import PropTypes from 'prop-types';


export default class Swipe extends Component{
	
	static propTypes = {
		onSwipeLeft: PropTypes.func,
		onSwipeRight: PropTypes.func,
		onSwipeUp: PropTypes.func,
		onSwipeDown: PropTypes.func,
		onClick: PropTypes.func,
		onTap: PropTypes.func,
		onMouseMove: PropTypes.func,
		// minimum distance to be considered a swipe
		minDistance: PropTypes.number
	};

	static defaultProps = {
		minDistance: 50
	}

	constructor(props){
		super(props);
		this.cancelClick = false;
	}

	onClick = e => {
		let {onClick} = this.props;
		if (this.cancelClick){
			e.stopPropagation();
			e.preventDefault();
			this.cancelClick = false;
		}
		else{
			if (typeof onClick === 'function'){
				onClick.call(null, e);
			}
		}
	}

	onTouchStart = e => {
		let {
			pageX,
			pageY
		} = e.touches[0];
		this.cancelClick = true;

		let numTouches = Object.keys(e.touches).length;
		if (numTouches === 1){
			this.touchStart = {
				startX: pageX,
				startY: pageY
			};
			this.ignoreNextTouchEnd = false;
		}
		else{
			this.ignoreNextTouchEnd = true;
		}
	}

	onTouchEnd = e => {
		let {
			onSwipeRight,
			onSwipeLeft,
			onSwipeUp,
			onSwipeDown,
			onTap,
			minDistance,
		} = this.props;

		let {
			pageX,
			pageY
		} = e.changedTouches[0];

		if (this.touchStart && !this.ignoreNextTouchEnd){
			let endX = pageX;
			let endY = pageY;
			
			let {
				startX,
				startY
			} = this.touchStart;

			let distY = Math.abs(pageY - startY);
			let distX = Math.abs(pageX - startX);
			let dist = Math.sqrt(
				Math.pow(endX - startX, 2)
				+ Math.pow(endY - startY, 2)
			);
			
			let arg = {
				distX,
				distY,
				dist,
				startX,
				startY,
				endX,
				endY
			};

			if (dist < minDistance){
				onTap(arg);
			}
			else{
				if (distY > distX){
					// more vertical
					if (startY < endY){
						if (typeof onSwipeDown === 'function'){
							onSwipeDown(arg);
						}
					}
					else if (startY > endY){
						if (typeof onSwipeUp === 'function'){
							onSwipeUp(arg);
						}
					}
				}
				else{
					// more horizontal
					if (startX > endX){
						if (typeof onSwipeLeft === 'function'){
							onSwipeLeft(arg);
						}
					}
					else if (startX < endX){
						if (typeof onSwipeRight === 'function'){
							onSwipeRight(arg);
						}
					}
				}
			}
		}
	}

	onMouseMove = (e) => {
		let {onMouseMove} = this.props;
		if (!this.cancelClick){
			if (typeof onMouseMove === 'function'){
				onMouseMove.call(null, e);
			}
		}
	}

	render(){
		let {
			onSwipeRight,
			onSwipeLeft,
			onSwipeUp,
			onSwipeDown,
			onTap,
			onClick,
			onMouseMove,
			minDistance,
			...props
		} = this.props;
		return (
			<div
				onTouchStart={this.onTouchStart}
				onTouchEnd={this.onTouchEnd}
				onClick={this.onClick}
				onMouseMove={this.onMouseMove}
				{...props}
			/>
		);
	}
}