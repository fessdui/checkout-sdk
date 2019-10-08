import React from 'react';
import styles from './item-line.scss';

export default class ItemLine extends React.PureComponent {
    /**
     * Get label and add brand if it exist.
     *
     * @returns {*}
     */
    getLabel(){
        const { brand, label }  = this.props;
        let labelHtml = (<div> { label } </div>);

        if (brand) {
            labelHtml = (<div> { label } ({brand}) </div>);
        }

        return (<div className={ styles.label }>
            {labelHtml}
        </div>);
    }

    render() {
        return (
            <div className={ styles.container }>
                <div className={ styles.labelContainer }>
                    { this.props.imageUrl &&
                    <img
                        src={ this.props.imageUrl }
                        className={ styles.image }/>
                    }

                    {this.getLabel()}
                </div>

                <div className={ styles.amount }>
                    { this.props.amount }
                </div>
            </div>
        );
    }
}
