<script setup lang="ts">
import VanCard from '..';
import VanButton from '../../button';
import VanIcon from '../../icon';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const imageURL = new URL('../../tag/assets/stamp-frame1.svg', import.meta.url)
  .href;

const t = useTranslate({
  'zh-CN': {
    basic: '基础用法',
    customContent: '自定义内容区',
    titleAction: '标题右侧操作',
    textList: '文案列表',
    footer: '底部按钮与注释',
    imageLarge: '大图文',
    imageDouble: '双列图文',
    imageRight: '左文右图',
    title: '主标题文本',
    subtitle: '辅助说明文字',
    corner: '角标',
    tag: '标签',
    tag1: '标签一',
    tag2: '标签二',
    customButton: '自定义按钮',
    label: '字段名',
    value: '字段内容较长时可换行展示',
    expand: '展开',
    copy: '复制',
    noteLeft: '0阅读',
    noteRight: '2026-6-1',
    noteLeftAlign: '注释信息左对齐',
    noteRightAlign: '注释信息右对齐',
    btn1: '按钮一',
    btn2: '按钮二',
    btn3: '按钮三',
    btn4: '按钮四',
    btn5: '按钮五',
    outlineBtn1: '立即购买',
    outlineBtn2: '查看详情',
    outlineBtn3: '取消订单',
    outlineBtn4: '确认提交',
    outlineBtn5: '申请退款',
    action: '操作',
    titleActionBtn: '管理',
    selectable: '可选卡片',
    fullCase: '综合示例',
    avatar: '标题头像',
    bodyLink: '无标题可跳转',
    faceAmount: '票面金额（元）',
    productType: '产品类型',
    amountValue1: '100,000.00',
    amountValue2: '50,000.00',
    rateValue: '3.25%',
    productValue: '结构性存款',
    yieldLabel: '七日年化收益',
    yieldValue: '100%',
    redeemValue: '随时申赎 T+1',
    purchaseNote: '10元起购｜中风险',
    footerNoteWithIcon: '注释信息一行带 icon占位占位占位占占位占位',
  },
  'en-US': {
    basic: 'Basic Usage',
    customContent: 'Custom Content',
    titleAction: 'Title Action',
    textList: 'Text List',
    footer: 'Footer Buttons & Notes',
    imageLarge: 'Large Image',
    imageDouble: 'Double Column',
    imageRight: 'Text + Image',
    title: 'Card Title',
    subtitle: 'Subtitle text',
    corner: 'Mark',
    tag: 'Tag',
    tag1: 'Tag 1',
    tag2: 'Tag 2',
    customButton: 'Custom Action',
    label: 'Label',
    value: 'Value content',
    expand: 'More',
    copy: 'Copy',
    noteLeft: 'Left note',
    noteRight: 'Right note',
    noteLeftAlign: 'Left note',
    noteRightAlign: 'Right note',
    btn1: 'Action 1',
    btn2: 'Action 2',
    btn3: 'Action 3',
    btn4: 'Action 4',
    btn5: 'Action 5',
    outlineBtn1: 'Buy Now',
    outlineBtn2: 'View Info',
    outlineBtn3: 'Cancel',
    outlineBtn4: 'Confirm',
    outlineBtn5: 'Refund',
    action: 'Action',
    titleActionBtn: 'Manage',
    selectable: 'Selectable',
    fullCase: 'Full Example',
    avatar: 'Title Avatar',
    bodyLink: 'Body Link',
    faceAmount: 'Face Amount (CNY)',
    productType: 'Product Type',
    amountValue1: '100,000.00',
    amountValue2: '50,000.00',
    rateValue: '3.25%',
    productValue: 'Structured Deposit',
    yieldLabel: '7-Day Annualized Yield',
    yieldValue: '100%',
    redeemValue: 'Redeem Anytime T+1',
    purchaseNote: 'From CNY 10 | Medium Risk',
    footerNoteWithIcon: 'Note with icon',
  },
});

// text-list 示例：buttonText 预制按钮 + actionSlot 匹配命名插槽
const textListItems = [
  {
    label: '开户行',
    value: '中国工商银行股份有限公司',
    valueRows: 2,
    actionSlot: 'copy',
  },
  { label: '账号', value: '6222 **** **** 1234', actionSlot: 'account' },
  { label: '户名', value: '张三', buttonText: t('action') },
  { label: '币种', value: '人民币' },
  { label: '备注', value: '工资卡' },
];

const onContentAction = (payload: {
  index: number;
  item: { label: string };
}) => {
  console.log('click-content-action', payload.index, payload.item.label);
};

const onClickTitle = () => {
  console.log('click-title');
};

const onClickButton = (payload: { name?: string | number; text: string }) => {
  console.log('click-button', payload.name, payload.text);
};

const onSelect = (selected: boolean) => {
  console.log('select', selected);
};

const titleSelected = ref(false);
const bodySelected = ref(false);
const fullSelected = ref(false);
</script>

<template>
  <demo-block :title="t('basic')">
    <van-card
      type="default"
      :title="t('title')"
      :subtitle="t('subtitle')"
      is-link
      :status-tag-props="{ type: 'primary', text: t('corner') }"
      :tags="[
        { text: t('tag1'), type: 'primary', plain: true },
        { text: t('tag2'), type: 'success', plain: true },
      ]"
      @click-title="onClickTitle"
    />
    <van-card
      type="default"
      :title="t('title')"
      :subtitle="t('subtitle')"
      is-link
      :status-tag-props="{ type: 'primary' }"
      :tags="[
        { text: t('tag1'), type: 'primary', plain: true },
        { text: t('tag2'), type: 'success', plain: true },
      ]"
      @click-title="onClickTitle"
    >
      <template #status-tag>{{ t('corner') }}9999</template>
    </van-card>
  </demo-block>

  <demo-block :title="t('avatar')">
    <van-card
      type="default"
      :avatar="imageURL"
      avatar-size="small"
      :title="t('title')"
      :subtitle="t('subtitle')"
      :tags="[{ text: t('tag'), type: 'primary', plain: true }]"
    />
    <van-card
      type="default"
      :avatar="imageURL"
      avatar-size="large"
      :title="t('title')"
      :subtitle="t('subtitle')"
      :tags="[{ text: t('tag'), type: 'primary', plain: true }]"
      style="margin-top: var(--van-padding-sm)"
    />
  </demo-block>

  <!-- 标题右侧操作：badge + is-link / #title-action -->
  <demo-block :title="t('titleAction')">
    <van-card
      type="default"
      :title="t('title')"
      :badge="3"
      is-link
      @click-title="onClickTitle"
    />
    <van-card
      type="default"
      :title="t('title')"
      :subtitle="t('subtitle')"
      style="margin-top: var(--van-padding-sm)"
    >
      <template #title-action>
        <div class="demo-card-title-action">{{ t('customButton') }}</div>
      </template>
    </van-card>
  </demo-block>

  <demo-block :title="t('bodyLink')">
    <van-card
      type="default"
      :show-title="false"
      is-link
      content-type="text-list"
      :content-items="[
        { label: t('label'), value: t('value') },
        {
          label: t('label'),
          value: '6222 **** **** 1234',
          buttonText: t('action'),
        },
      ]"
      @click-title="onClickTitle"
      @click-content-action="onContentAction"
    />
  </demo-block>
  <!-- 文案内容列表 -->
  <demo-block :title="t('textList')">
    <van-card
      type="default"
      :title="t('title')"
      :subtitle="t('subtitle')"
      content-type="text-list"
      :content-items="textListItems"
      collapsible
      :collapse-rows="3"
      @click-content-action="onContentAction"
    >
      <!-- 按 actionSlot 匹配：#text-list-action-{actionSlot} -->
      <template #text-list-action-account="{ onActionClick }">
        <van-button size="mini" type="primary" plain @click="onActionClick">
          {{ t('action') }}
        </van-button>
      </template>
      <!-- 按 actionSlot：开户行「复制」 -->
      <template #text-list-action-copy="{ onActionClick }">
        <span class="demo-card-text-action" @click="onActionClick">
          {{ t('copy') }}
        </span>
      </template>
    </van-card>
  </demo-block>
  <!-- 可选卡片 -->
  <demo-block :title="t('selectable')">
    <van-card
      type="default"
      selectable
      v-model:selected="titleSelected"
      is-link
      @click-title="onClickTitle"
      :title="t('title')"
      :subtitle="t('subtitle')"
      content-type="text-list"
      :content-items="[
        { label: t('label'), value: t('value') },
        { label: t('label'), value: t('value') },
      ]"
      @select="onSelect"
    />
    <van-card
      type="default"
      selectable
      v-model:selected="bodySelected"
      is-link
      @click-title="onClickTitle"
      :show-title="false"
      content-type="text-list"
      :content-items="[
        { label: t('label'), value: t('value') },
        { label: t('label'), value: t('value') },
      ]"
      style="margin-top: var(--van-padding-sm)"
    />
  </demo-block>

  <demo-block :title="t('footer')">
    <van-card
      type="default"
      :title="t('title')"
      content-type="text-list"
      :content-items="[
        { label: t('label'), value: t('value') },
        { label: t('label'), value: t('value') },
        { label: t('label'), value: t('value') },
      ]"
      show-footer-buttons
      footer-button-type="text"
      :footer-buttons="[
        { text: t('btn1'), name: 'a', color: 'var(--van-primary-color)' },
        { text: t('btn2'), name: 'b', disabled: true },
        { text: t('btn3'), name: 'c' },
        { text: t('btn4'), name: 'd' },
        { text: t('btn5'), name: 'e' },
      ]"
      footer-note-layout="center"
      :footer-note="t('subtitle')"
      @click-button="onClickButton"
    />
    <van-card
      type="default"
      :title="t('title')"
      content-type="text-list"
      :content-items="[
        { label: t('label'), value: t('value') },
        { label: t('label'), value: t('value') },
        { label: t('label'), value: t('value') },
      ]"
      show-footer-buttons
      footer-button-type="outline"
      :footer-buttons="[
        {
          text: t('outlineBtn1'),
          name: 'a',
          color: 'var(--van-primary-color)',
        },
        { text: t('outlineBtn2'), name: 'b', disabled: true },
        { text: t('outlineBtn3'), name: 'c' },
        { text: t('outlineBtn4'), name: 'd' },
        { text: t('outlineBtn5'), name: 'e' },
      ]"
      footer-note-layout="split"
      :footer-note-left="t('noteLeft')"
      :footer-note-right="t('noteRight')"
      style="margin-top: var(--van-padding-sm)"
      @click-button="onClickButton"
    />
  </demo-block>

  <!-- 综合示例 -->
  <demo-block :title="t('fullCase')">
    <van-card
      type="default"
      selectable
      v-model:selected="fullSelected"
      :title="t('title')"
      :subtitle="t('subtitle')"
      :avatar="imageURL"
      avatar-size="small"
      is-link
      :status-tag-props="{ type: 'primary' }"
      :tags="[
        { text: t('tag1'), type: 'primary', plain: true },
        { text: t('tag2'), type: 'success', plain: true },
      ]"
      content-type="text-list"
      :content-items="textListItems"
      collapsible
      :collapse-rows="3"
      show-footer-buttons
      footer-button-type="text"
      :footer-buttons="[
        { text: t('btn1'), name: 'a', color: 'var(--van-primary-color)' },
        { text: t('btn2'), name: 'b' },
        { text: t('action'), name: 'c' },
      ]"
      footer-note-layout="split"
      :footer-note-left="t('noteLeft')"
      :footer-note-right="t('noteRight')"
      @click-title="onClickTitle"
      @click-content-action="onContentAction"
      @click-button="onClickButton"
      @select="onSelect"
    >
      <template #status-tag>{{ t('corner') }}</template>
      <template #text-list-action-account="{ onActionClick }">
        <van-button size="mini" type="primary" plain @click="onActionClick">
          {{ t('action') }}
        </van-button>
      </template>
      <template #text-list-action-copy="{ onActionClick }">
        <span class="demo-card-text-action" @click="onActionClick">
          {{ t('copy') }}
        </span>
      </template>
    </van-card>
  </demo-block>
  <!-- 自定义使用内容案例： -->
  <demo-block :title="t('customContent')">
    <van-card
      type="default"
      :title="t('title')"
      :subtitle="t('subtitle')"
      :tags="[
        { text: t('tag1'), type: 'primary', plain: true },
        { text: t('tag2'), type: 'success', plain: true },
      ]"
      footer-note-layout="split"
      :footer-note-left="t('noteLeftAlign')"
      :footer-note-right="t('noteRightAlign')"
    >
      <template #title-action>
        <div class="demo-card-title-action">
          {{ t('customButton') }}
          <van-icon name="arrow" />
        </div>
      </template>
      <div class="demo-card-thirds">
        <div class="demo-card-thirds__item">
          <div class="demo-card-thirds__value demo-card-thirds__value--primary">
            {{ t('amountValue1') }}
          </div>
          <div class="demo-card-thirds__label">{{ t('faceAmount') }}</div>
        </div>
        <div class="demo-card-thirds__item">
          <div class="demo-card-thirds__value">{{ t('rateValue') }}</div>
          <div class="demo-card-thirds__label">{{ t('faceAmount') }}</div>
        </div>
        <div class="demo-card-thirds__item">
          <div class="demo-card-thirds__value">{{ t('productValue') }}</div>
          <div class="demo-card-thirds__label">{{ t('productType') }}</div>
        </div>
      </div>
    </van-card>

    <van-card
      type="default"
      :title="t('title')"
      :tags="[
        { text: t('tag1'), type: 'primary', plain: true },
        { text: t('tag2'), type: 'success', plain: true },
      ]"
      footer-note-layout="left"
      style="margin-top: var(--van-padding-sm)"
    >
      <div class="demo-card-halves">
        <div class="demo-card-halves__item">
          <div class="demo-card-halves__value demo-card-halves__value--primary">
            {{ t('amountValue1') }}
          </div>
          <div class="demo-card-halves__label">{{ t('faceAmount') }}</div>
        </div>
        <div class="demo-card-halves__item">
          <div class="demo-card-halves__value">{{ t('rateValue') }}</div>
          <div class="demo-card-halves__label">{{ t('faceAmount') }}</div>
        </div>
      </div>
      <template #footer-note>
        <span class="demo-card-footer-note">
          <van-icon name="info-o" class="demo-card-footer-note__icon" />
          {{ t('footerNoteWithIcon') }}
        </span>
      </template>
    </van-card>

    <van-card
      type="default"
      title="宁银理财｜天欣天天鎏金现金管理类理财产品3号"
      style="margin-top: var(--van-padding-sm)"
    >
      <div class="demo-card-split">
        <div class="demo-card-split__item demo-card-split__item--left">
          <div class="demo-card-split__value demo-card-split__value--danger">
            {{ t('yieldValue') }}
          </div>
          <div class="demo-card-split__label">{{ t('yieldLabel') }}</div>
        </div>
        <div class="demo-card-split__item demo-card-split__item--right">
          <div class="demo-card-split__value">{{ t('redeemValue') }}</div>
          <div class="demo-card-split__label">{{ t('purchaseNote') }}</div>
        </div>
      </div>
    </van-card>
  </demo-block>
  <demo-block :title="t('imageLarge')">
    <van-card
      type="image-large"
      :title="t('title')"
      :subtitle="t('subtitle')"
      :image="imageURL"
      image-fit="contain"
    >
    </van-card>
  </demo-block>
  <!-- 双列图文卡片：父级 flex 并排，卡片 flex:1 均分 -->
  <demo-block :title="t('imageDouble')">
    <div class="demo-card-image-double">
      <van-card
        type="image-double"
        :image="imageURL"
        :title="t('title')"
        footer-note-layout="split"
        :footer-note-left="t('noteLeft')"
        :footer-note-right="t('noteRight')"
      />
      <van-card
        type="image-double"
        :image="imageURL"
        :title="t('title')"
        footer-note-layout="split"
        :footer-note-left="t('noteLeft')"
        :footer-note-right="t('noteRight')"
      />
    </div>
  </demo-block>

  <demo-block :title="t('imageRight')">
    <van-card
      type="image-right"
      :image="imageURL"
      :title="t('title')"
      footer-note-layout="split"
      :footer-note-left="t('noteLeft')"
      :footer-note-right="t('noteRight')"
    />
  </demo-block>
</template>

<style lang="less">
.demo-card-title-action {
  display: inline-flex;
  align-items: center;
  color: var(--van-danger-color);
  font-size: var(--van-font-size-sm);
  line-height: var(--van-line-height-sm);
  cursor: pointer;
}

.demo-card-text-action {
  color: var(--van-primary-color);
  font-size: var(--van-font-size-sm);
  line-height: var(--van-line-height-md);
  cursor: pointer;
}

.demo-card-image-double {
  display: flex;
  gap: var(--van-padding-xs);
  align-items: flex-start;
}

// 插槽内容区：数值 + 底部标题（三等分 / 双等分共用）
.demo-card-thirds,
.demo-card-halves {
  display: flex;
  align-items: flex-end;

  &__value {
    font-size: var(--van-font-size-sm);
    line-height: var(--van-line-height-md);
    color: var(--van-text-color);

    &--primary {
      font-size: var(--van-font-size-lg);
      line-height: var(--van-line-height-xl);
      color: var(--van-primary-color);
    }
  }

  &__label {
    margin-top: var(--van-padding-base);
    font-size: var(--van-font-size-sm);
    line-height: var(--van-line-height-sm);
    color: var(--van-text-color-2);
  }
}

.demo-card-thirds {
  &__item {
    flex: 1;
    min-width: 0;
    text-align: center;

    &:first-child {
      text-align: left;
    }

    &:last-child {
      text-align: right;
    }
  }
}

.demo-card-halves {
  &__item {
    flex: 1;
    min-width: 0;

    &:first-child {
      text-align: left;
    }

    &:last-child {
      text-align: right;
    }
  }
}

.demo-card-footer-note {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  font-size: var(--van-font-size-sm);
  line-height: var(--van-line-height-sm);
  color: var(--van-text-color-2);

  &__icon {
    flex: none;
    margin-right: var(--van-padding-base);
    font-size: var(--van-font-size-sm);
  }
}

// 插槽内容区：左大数值 + 右说明
.demo-card-split {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  &__item {
    min-width: 0;

    &--left {
      text-align: left;

      .demo-card-split__value {
        font-size: var(--van-font-size-lg);
        line-height: var(--van-line-height-xl);
      }
    }

    &--right {
      text-align: right;

      .demo-card-split__value {
        font-size: var(--van-font-size-md);
        line-height: var(--van-line-height-lg);
      }
    }
  }

  &__value {
    font-size: var(--van-font-size-sm);
    line-height: var(--van-line-height-md);
    color: var(--van-text-color);

    &--danger {
      color: var(--van-danger-color);
    }
  }

  &__label {
    margin-top: var(--van-padding-base);
    font-size: var(--van-font-size-sm);
    line-height: var(--van-line-height-sm);
    color: var(--van-text-color-2);
  }
}
</style>
