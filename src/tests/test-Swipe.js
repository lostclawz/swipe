import React from 'react';
import {expect} from 'chai';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import Swipe from '../Swipe';

export function notCalled(items, spySet){
	let pass = true;
	items.forEach(item => {
		expect(spySet[item].notCalled)
		.to.be.true;
		if (!spySet[item].notCalled){
			pass = false;
		}
	});
	return pass;
}

export function EventMock(opts, changed=false){
	if (!opts){
		opts = {};
	}
	let {
		x=50,
		y=50,
		changedTouches = true
	} = opts;
	this.stopPropagation = sinon.spy();
	this.preventDefault = sinon.spy();
	this.touches = [{pageX: x, pageY: y}];
	if (changedTouches || changed){
		this.changedTouches = [{pageX: x, pageY: y}];
	}
	return this;
}


const getSwipeArg = (start, end) => ({
	startX: start.x,
	startY: start.y,
	endX: end.x,
	endY: end.y,
	distX: Math.abs(end.x - start.x),
	distY: Math.abs(end.y - start.y),
	dist: Math.sqrt(
		Math.pow(end.x - start.x, 2)
		+ Math.pow(end.y - start.y, 2)
	)
})


describe('<Swipe/>', function(){
	var wrapper;
	var testProps;

	beforeEach(function(){
		testProps = {
			onSwipeRight: sinon.spy(),
			onSwipeLeft: sinon.spy(),
			onSwipeUp: sinon.spy(),
			onSwipeDown: sinon.spy(),
			onTap: sinon.spy(),
			onClick: sinon.spy(),
			onMouseMove: sinon.spy(),
			minDistance: 50,
			className: "test"
		};
		wrapper = shallow(
			<Swipe {...testProps}>
				<div className="test-child"></div>
			</Swipe>
		);
	})

	it('renders a div wrapping children', () => {
		expect(wrapper.children().length).to.equal(1);
		expect(wrapper.find('div.test-child')).to.have.lengthOf(1);
	});
	it('watches for onTouchStart, onTouchEnd, onClick, and onMouseMove event', () => {
		expect(wrapper.findWhere(el => 
			typeof el.props().onTouchStart === 'function'
			&& typeof el.props().onTouchEnd === 'function'
			&& typeof el.props().onClick === 'function'
			&& typeof el.props().onMouseMove === 'function'
		)).to.have.lengthOf(1);
	});
	it('ignores click events if an onTouchStart event is detected', () => {
		let touchEvent = new EventMock();
		wrapper.simulate('touchstart', touchEvent);
		let clickEvent = new EventMock();
		wrapper.simulate('click', clickEvent);
		expect(touchEvent.stopPropagation.notCalled).to.be.true;
		expect(clickEvent.stopPropagation.calledOnce).to.be.true;
	});
	it('fires click event when no onTouchStart event is detected', () => {
		let clickEvent = new EventMock();
		wrapper.simulate('click', clickEvent);
		expect(clickEvent.preventDefault.notCalled).to.be.true;
		expect(clickEvent.stopPropagation.notCalled).to.be.true;
	});
	it('fires onSwipeRight prop if touch events move right more than up or down', () => {
		let start = {x: 0, y: 0};
		let end = {x: 200, y: 0};
		wrapper.simulate('touchstart', new EventMock(start));
		wrapper.simulate('touchend', new EventMock(end, true));
		
		expect(testProps.onSwipeRight.calledOnce).to.be.true;
		expect(testProps.onSwipeRight.lastCall.args[0])
		.to.deep.equal(getSwipeArg(start, end));
		
		notCalled(['onSwipeUp', 'onSwipeLeft', 'onSwipeDown'], testProps);

	});
	it('fires onSwipeLeft prop if touch events move left more than up or down', () => {
		let start = {x: 500, y: 200};
		let end = {x: 200, y: 100};
		wrapper.simulate('touchstart', new EventMock(start));
		wrapper.simulate('touchend', new EventMock(end, true));
		
		expect(testProps.onSwipeLeft.calledOnce).to.be.true;
		expect(testProps.onSwipeLeft.lastCall.args[0])
		.to.deep.equal(getSwipeArg(start, end));
		
		notCalled(['onSwipeUp', 'onSwipeRight', 'onSwipeDown'], testProps);
	});
	it('fires onSwipeDown prop if touch events move more down than left or right', () => {
		let start = {x: 250, y: 100};
		let end = {x: 200, y: 200};
		wrapper.simulate('touchstart', new EventMock(start));
		wrapper.simulate('touchend', new EventMock(end, true));
		
		expect(testProps.onSwipeDown.calledOnce).to.be.true;
		expect(testProps.onSwipeDown.lastCall.args[0])
		.to.deep.equal(getSwipeArg(start, end));

		notCalled(['onSwipeUp', 'onSwipeRight', 'onSwipeLeft'], testProps);
	});
	it('fires onSwipeUp prop if touch events move more up than left or right', () => {
		let start = {x: 0, y: 200};
		let end = {x: 0, y: 100};
		wrapper.simulate('touchstart', new EventMock(start));
		wrapper.simulate('touchend', new EventMock(end, true));
		
		expect(testProps.onSwipeUp.calledOnce).to.be.true;
		expect(testProps.onSwipeUp.lastCall.args[0])
		.to.deep.equal(getSwipeArg(start, end));
		
		notCalled(['onSwipeLeft', 'onSwipeRight', 'onSwipeDown'], testProps);
	});

	it("fires onTap prop if touch events don't travel as far as minDistance", () => {
		let start = {x: 0, y: 0};
		let end = {x: 10, y: 0};
		wrapper.simulate('touchstart', new EventMock(start));
		wrapper.simulate('touchend', new EventMock(end, true));
		notCalled(['onSwipeUp', 'onSwipeRight', 'onSwipeDown', 'onSwipeLeft'], testProps);
		expect(testProps.onTap.calledOnce).to.be.true;
	});
	it('only fires callbacks if the touch events travel further than props.minDistance', () => {
		let start = {x: 0, y: 0};
		let end = {x: 10, y: 0};
		wrapper.simulate('touchstart', new EventMock(start));
		wrapper.simulate('touchend', new EventMock(end, true));
		notCalled(['onSwipeUp', 'onSwipeRight', 'onSwipeDown', 'onSwipeLeft'], testProps);

		start = {x: 0, y: 50};
		end = {x: 0, y: 100};
		wrapper.simulate('touchstart', new EventMock(start));
		wrapper.simulate('touchend', new EventMock(end, true));
		expect(testProps.onSwipeDown.calledOnce).to.be.true;

		expect(testProps.onSwipeDown.lastCall.args[0])
		.to.deep.equal(getSwipeArg(start, end));

		notCalled(['onSwipeUp', 'onSwipeRight', 'onSwipeLeft'], testProps);
	});
	it('fires props.onMouseMove if mouseMove events are detected', () => {
		wrapper.instance().cancelClick = true;
		wrapper.simulate('mousemove');
		expect(testProps.onMouseMove.notCalled).to.be.true;
		wrapper.instance().cancelClick = false;
		wrapper.simulate('mousemove');
		expect(testProps.onMouseMove.calledOnce).to.be.true;
	});
	it('passes any extra props to div wrapper element', () => {
		expect(wrapper.find('.test')).to.have.lengthOf(1);
	});
})