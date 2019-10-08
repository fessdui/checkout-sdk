import React from 'react';
import styles from './layout.scss';

export default function Layout({body}){
    return (
        <main className={ styles.main }>
            <div className={ styles.container }>
                { body }
            </div>
        </main>
    );
}