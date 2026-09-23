export function PricingCard() {
  return (
    <aside className="pricing-card" aria-labelledby="pricing-title" data-reveal="rise">
      <div className="pricing-card__header">
        <span className="pricing-card__eyebrow">SERVICE &amp; PRICE <span aria-hidden="true">✦</span> 订阅价目</span>
        <h2 id="pricing-title">Plus 代充<span>·</span>价格一览</h2>
        <p>清晰标价，按需选择</p>
      </div>
      <div className="pricing-card__list">
        <div className="pricing-card__item">
          <div className="pricing-card__description">
            <span className="pricing-card__number">01 / 单次订阅</span>
            <strong>GPT 代充 <em>Plus 订阅</em></strong>
          </div>
          <div className="pricing-card__price"><span>¥</span>121</div>
        </div>
        <div className="pricing-card__item">
          <div className="pricing-card__description">
            <span className="pricing-card__number">02 / 5× 套餐</span>
            <strong>5× <em>Plus 订阅</em></strong>
          </div>
          <div className="pricing-card__price"><span>¥</span>665</div>
        </div>
      </div>
      <p className="pricing-card__contact"><span aria-hidden="true">↘</span>购买请添加右下角客服微信</p>
    </aside>
  )
}
