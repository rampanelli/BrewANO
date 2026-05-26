import React, { Component } from 'react';
import T from 'i18n-react';
import en from "../language/en.json"
import LayoutContext from '../context/LayoutContext'
import { notifyLangChanged } from '../context/LayoutContext'

var langCache = {
  "en": en
};

function fetchLang(code) {
  if (langCache[code]) return Promise.resolve(langCache[code]);
  return fetch("/lang/" + code + ".json")
    .then(r => {
      if (!r.ok) throw new Error("lang not found");
      return r.text();
    })
    .then(text => {
      var data = JSON.parse(text);
      langCache[code] = data;
      return data;
    })
    .catch(() => {
      return en;
    });
}

class IntText extends Component {
  constructor(props) {
    super(props)
  }

  SetText(lang) {
    var apply = function(data) {
      T.setTexts(data);
      notifyLangChanged();
    };

    if (langCache[lang]) {
      apply(langCache[lang]);
      this.forceUpdate();
    } else {
      fetchLang(lang).then(data => {
        apply(data);
        this.forceUpdate();
      });
    }
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
