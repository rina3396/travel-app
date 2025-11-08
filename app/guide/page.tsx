// app/guide/page.tsx // 使い方ガイドページ
import Card from "@/components/ui/Card" // カードUIコンポーネント
import Button from "@/components/ui/Button" // ボタンコンポーネント
import BackButton from "@/components/ui/BackButton" // 戻るボタン

export default function GuidePage() { // ガイドページコンポーネント
  return ( // コンテンツの描画
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4"> {/* 幅・余白調整済みセクション */}
      <div> {/* 戻るボタンのラッパー */}
        <BackButton label="�߂�" /> {/* 戻る */}
      </div>
      <header className="space-y-1"> {/* ヘッダー領域 */}
        <h1 className="text-2xl font-bold">�g����</h1> {/* タイトル */}
        <p className="text-sm text-gray-600">���̃A�v���̑�����@���܂Ƃ߂Ă��܂��B</p> {/* 概要説明 */}
      </header>

      <Card title="�͂��߂�" description="�����쐬���ă_�b�V���{�[�h����e�@�\�ֈړ����܂��B"> {/* はじめにカード */}
        <div className="flex items-center justify-between"> {/* 横並び */}
          <div className="text-sm text-gray-700">�V�K�쐬�{�^������A���̂�������쐬�ł��܂��B</div> {/* 説明文 */}
          <Button href="/trips/new">�V�K�쐬</Button> {/* 新規作成ボタン */}
        </div>
      </Card>

      <Card title="���̈ꗗ" description="�쐬�ς݂̗����m�F�ł��܂��B"> {/* 一覧カード */}
        <div className="flex items-center justify-between"> {/* 横並び */}
          <div className="text-sm text-gray-700">���̈ꗗ�{�^������A�쐬�������̂�������J�����Ƃ��ł��܂��B</div> {/* 説明文 */}
          <Button href="/trips" variant="outline">���̈ꗗ</Button> {/* 一覧ボタン */}
        </div>
      </Card>

      <Card title="��ȋ@�\" description="�_�b�V���{�[�h����e�y�[�W�Ɉړ����ĕҏW���܂��B"> {/* 機能紹介カード */}
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700"> {/* 箇条書き */}
          <li>����: ���t���Ƃ̗\����Ǘ����܂��B</li> {/* 旅行情報 */}
          <li>�A�N�e�B�r�e�B: ���������\���ǉ����܂��B</li> {/* アクティビティ */}
          <li>�\�Z�E��p: �x�o��o�^�����v���m�F���܂��B</li> {/* 予算管理 */}
          <li>TODO�E������: ������ו��̃`�F�b�N���X�g�ł��B</li> {/* タスク管理 */}
          <li>���L: ���̃����N�����L���܂��B</li> {/* 設定 */}
          <li>�v���r���[: �쐬�������̂�����{���A�o�͂��ł��܂��B</li> {/* プレビュー/共有 */}
        </ul>
      </Card>

      {/* <footer className="pt-2 text-center text-xs text-gray-500">���̃K�C�h�͐����X�V����܂��B</footer> */} {/* フッター（未使用） */}
    </section>
  )
}

