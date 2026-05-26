import React, { Component } from 'react';
import T from 'i18n-react';
import en from "../language/en.json"
import ptBR from "../language/pt-BR.json"
import ruRU from "../language/ru-RU.json"
import es from "../language/es.json"
import ja from "../language/ja.json"
import it from "../language/it.json"
import no from "../language/no.json"
import da from "../language/da.json"
import sv from "../language/sv.json"
import de from "../language/de.json"
import fr from "../language/fr.json"
import nl from "../language/nl.json"
import pl from "../language/pl.json"
import cs from "../language/cs.json"
import LayoutContext from '../context/LayoutContext'
import { notifyLangChanged } from '../context/LayoutContext'

class IntText extends Component {
  constructor(props) {
    super(props)
  }

  SetText(lang) {
    switch (lang) {
      case "pt-BR": T.setTexts(ptBR); break
      case "en": T.setTexts(en); break
      case "ru-RU": T.setTexts(ruRU); break
      case "es": T.setTexts(es); break
      case "ja": T.setTexts(ja); break
      case "it": T.setTexts(it); break
      case "no": T.setTexts(no); break
      case "da": T.setTexts(da); break
      case "sv": T.setTexts(sv); break
      case "de": T.setTexts(de); break
      case "fr": T.setTexts(fr); break
      case "nl": T.setTexts(nl); break
      case "pl": T.setTexts(pl); break
      case "cs": T.setTexts(cs); break
      default: T.setTexts(en); break
    }
    notifyLangChanged();
    this.forceUpdate()
  }

  render() {
    return (
      <LayoutContext.Consumer>
        {({ langKey }) => (
          <span key={langKey}>
            {this.props.spaceBefore ? ' ' : null}
            <T.span text={this.props.text} />
            {this.props.spaceAfter ? ' ' : null}
          </span>
        )}
      </LayoutContext.Consumer>
    )
  }
}

export default IntText;
