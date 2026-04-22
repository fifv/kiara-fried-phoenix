import { range } from "es-toolkit"
import React, { memo, useEffect, useRef, useState } from "react"
export default function App() {
	const [toggle, setToggle] = useState(false)
	const [count, setCount] = useState(0)

	// const l = 
	return (
		<div>
			{

			}
			<div className="h-40 flex items-center justify-center">something</div>
			<button onClick={ () => { setCount(count + 1) } }>{ count }</button>
			{ <Vir
				datas={
					range(1000000)
				}
				rowHeight={ 30 }
				rowRenderer={ (data, index, style) => {
					const row =
						<div
							style={ style }
							key={ index }
							className='border border-red-600'
						>
							{ data }
							{/* <Button></Button> */ }
						</div>
					return row
				} }
			/> }
		</div>
	)
}
/**
 * Memo只能跳過re-render,
 * 不能跳過mount的那一次render
 */
const Button = memo(function Button({ children }: {
	children?: React.ReactNode
}) {
	const [toggle, setToggle] = useState(false)
	console.log('button',);
	return (
		<div className="z-40" onClick={ () => setToggle(!toggle) }>{ toggle ? 'on' : 'off' }{ children }</div>
	)
})


function Vir({ datas, rowHeight, rowRenderer }: {
	datas: React.ReactNode[],
	rowHeight: number,
	rowRenderer: (data, index, style) => React.ReactNode,
}) {
	const [startIndex, setStartIndex] = useState(0)
	const [endIndex, setEndIndex] = useState(0)
	const refContainer = useRef<HTMLDivElement>(null!)
	function handleScroll(e?: Event) {
		// console.log(e.scrollTop);
		const overflowPixel = window.innerHeight / 2
		const a = window.scrollY - refContainer.current?.offsetTop
		// console.log(
		// 	Math.floor((a - overflowPixel) / rowHeight),
		// 	Math.ceil((a + window.innerHeight + overflowPixel) / rowHeight)
		// );
		const startIndex = Math.max(Math.floor((a - overflowPixel) / rowHeight), 0)
		const endIndex = Math.min(Math.ceil((a + window.innerHeight + overflowPixel) / rowHeight), datas.length)
		/**
		 * scroll的瞬間,這個handleScroll被大量觸發,然後setState被大量觸發
		 * 這些setState
		 * 
		 * 抖動肯定是這個handleScroll裡的某個東西動到了scroll導致handleScroll被觸發
		 */
		setStartIndex(startIndex)
		setEndIndex(endIndex)
		// console.log(window.scrollY, refContainer.current?.offsetTop);
		console.log(startIndex, endIndex);
		// console.log();
	}
	useEffect(() => {
		addEventListener('scroll', handleScroll)
		console.log('addEventListener');
		handleScroll()
		return () => {
			removeEventListener('scroll', handleScroll)
			console.log('removeEventListener');
		}
	}, [])

	// console.time('nodes');
	// const nodes = components.slice(startIndex, endIndex).map((c, i) => {
	// 	return <div
	// 		key={ i }
	// 		style={ {
	// 			transform: `translate(0, ${(i + startIndex) * rowHeight}px)`,
	// 			height: rowHeight,
	// 			position: 'absolute'
	// 		} }
	// 		className={ 'border border-red-600' }
	// 	>{ c }</div>
	// })
	// console.timeEnd('nodes');

	// console.time('nodes');
	const nodes = datas.slice(startIndex, endIndex).map((data, index) => {
		return rowRenderer(
			data,
			index + startIndex,
			{
				transform: `translate(0, ${(index + startIndex) * rowHeight}px)`,
				height: rowHeight,
				position: 'absolute'
			}
		)
	})
	// console.timeEnd('nodes');

	return <div
		className="border border-blue-600"
		style={ {
			height: rowHeight * datas.length,
		} }
		ref={ refContainer }
	>
		{
			// components.map((c, i) => {
			// 	return <div key={ i } style={ {
			// 		transform: `translate(0, ${i * rowHeight}px)`,
			// 		height: rowHeight,
			// 		position: 'absolute'
			// 	} }>{ c }</div>
			// }).slice(lowBound, highBound)
		}
		{
			nodes
		}

	</div>
}
